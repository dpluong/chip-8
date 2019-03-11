class Assembler {
    /*
    Intialize a chip 8 assembler
    Take a text input as a parameter
	*/
    constructor(code) {
            /*
            Split text input into tokens
            */
            this.splitString = code
                .replace(/[\n\r]/g, ' newLine ')
                .replace(/\(/g, ' openBracket ')
                .replace(/\)/g, ' closeBracket ')
                .replace(/\+/g, ' add ')
                .replace(/\-/g, ' subtract ')
                .replace(/\^/g, ' xor ')
                .replace(/\|/g, ' or ')
                .replace(/\&/g, ' and ')
                .replace(/\=/g, ' assign ')
                .replace(/\,/g, ' comma ')
                .split(/[\t\f\v ]+/);
            /*
            An array of tokens
            */
            this.tokenList = [];
            /*
            A pointer to check index of a token
            */
            this.checkCurrent = 0;
            /*
            AST tree 
            */
            this.ast = {
                type: 'program',
                body: [],
            };
            /*
            A string contains chip 8 opcodes
            */
            this.codeString = "";
            /*
            An array of chip 8 opcodes
            */
            this.codeBinary = [];
        }
    /*
    Check if a token is a key word 
    Take an index of token as parameter
    */
    isKeyWord(current) {
            var keyWord = this.splitString[current];
            if (keyWord === 'skip' || keyWord === 'to' ||
                keyWord === 'call' || keyWord === 'jump' ||
                keyWord === 'shiftRight' || keyWord === 'shiftLeft' ||
                keyWord === 'memad' || keyWord === 'key' ||
                keyWord === 'delay' || keyWord === 'sound' ||
                keyWord === 'draw' || keyWord === 'rand' ||
                keyWord === 'clear' || keyWord === 'return')
                return true;
            else
                return false;
        }
    /* 
    Check if a token is a register 
    Take an index of token as parameter
    */
    isRegister(current) {
            var register = this.splitString[current];
            var re1 = /[0-9]/;
            var re2 = /[a-f]/;
            var char = register.charAt(register.length - 1);
            if ((re1.test(char) === true || re2.test(char) === true || char === 'i') &&
                register.length === 2 && register.charAt(0) === 'v')
                return true;
            else
                return false;
        }
    /*
    Handle error if an error occur
    */
    HandleError(e) {
            document.body.textContent = `An error occurred trying to run the program! ${e.message}`;
        }
    /*
    Tokenize
    */
    tokenize() {
            try {
                /* 
                Clean spaces between tokens
                */
                for (var i = this.splitString.length - 1; i >= 0; i--) {
                    if (this.splitString[i] === '')
                        this.splitString.splice(i, 1);
                }

                for (var i = 0; i < this.splitString.length; i++) {
                    var token = this.splitString[i];
                    if (token.length <= 0) {
                        continue;
                    }
                    if (token === 'newLine')
                        this.tokenList.push({
                            type: 'newLine'
                        });
                    else if (token === 'openBracket') {
                        this.tokenList.push({
                            type: 'punctuation',
                            value: '('
                        });
                    } else if (token === 'closeBracket') {
                        this.tokenList.push({
                            type: 'punctuation',
                            value: ')'
                        });
                    } else if (token === 'comma') {
                        this.tokenList.push({
                            type: 'punctuation',
                            value: ','
                        });
                    } else if (token === 'add') {
                        this.tokenList.push({
                            type: 'operation',
                            value: '+'
                        });
                    } else if (token === 'subtract') {
                        this.tokenList.push({
                            type: 'operation',
                            value: '-'
                        });
                    } else if (token === 'xor') {
                        this.tokenList.push({
                            type: 'operation',
                            value: '^'
                        });
                    } else if (token === 'or') {
                        this.tokenList.push({
                            type: 'operation',
                            value: '|'
                        });
                    } else if (token === 'and') {
                        this.tokenList.push({
                            type: 'operation',
                            value: '&'
                        });
                    } else if (token === 'assign') {
                        this.tokenList.push({
                            type: 'assign',
                            value: '='
                        });
                    } else if (isNaN(token) === false) {
                        this.tokenList.push({
                            type: 'number',
                            value: token
                        });
                    } else if (token === 'if') {
                        this.tokenList.push({
                            type: 'if'
                        })
                    } else if (this.isKeyWord(i)) {
                        this.tokenList.push({
                            type: 'keyword',
                            value: token
                        });
                    } else if (this.isRegister(i)) {
                        this.tokenList.push({
                            type: 'register',
                            value: token.charAt(token.length - 1)
                        });
                    } else if (token === 'equal' || token === 'not') {
                        this.tokenList.push({
                            type: 'condition',
                            value: token
                        });
                    } else {
                        throw new ReferenceError('Token not found');
                        break;
                    }
                }
            } catch (e) {
                this.HandleError(e);
                throw e;
            }
        }
    /*
    Check the next token 
    */
    expectToken(current) {
            if (current + 1 >= this.tokenList.length)
                return false;
            var nextToken = this.tokenList[current + 1];
            if ((nextToken.type) === 'newLine') {
                return nextToken.type;
            } else if (nextToken.type === 'punctuation' && nextToken.value === '(')
                return nextToken.value;
            else if (nextToken.type === 'operation')
                return nextToken.type;
            else if (nextToken.type === 'assign')
                return nextToken.type;
            else if (nextToken.value === 'to')
                return nextToken.value;
        }
    /*
    Parse operations including  {+,-,|,&,^}
    */
    parseOperation(current) {
        try {
            var tok = this.tokenList[++current];
            var tokLeft = this.tokenList[current - 1];
            var tokRight = this.tokenList[current + 1];
            if (tokRight.type !== 'register' && tokRight.type !== 'number')
                throw new ReferenceError('Unrecognized language');
            var node = {
                type: 'Calculation',
                name: tok.value,
                left: tokLeft,
                right: tokRight,
            }
            this.checkCurrent = current + 1;
            return node;
        } catch(e) {
            this.HandleError(e);
            throw e;
        }
    }
    /*
    Parse function 
    */
    parseExpression(current) {
            var tok = this.tokenList[++current];
            var node = {
                type: 'CallExpression',
                name: this.tokenList[current - 1].value,
                parameters: [],
            }
            tok = this.tokenList[++current];
            if (tok.value !== ')') {
                while (!(tok.value === ')')) {
                    if (tok.value === ',') {

                        tok = this.tokenList[++current];
                    }
                    node.parameters.push(this.tokenList[current]);
                    tok = this.tokenList[++current];
                }
            }
            this.checkCurrent = current;
            return node;
        }
    /*
    Parse condition statement 
    */
    parseIf(current) {
            var node;
            while (this.tokenList[current].value !== 'skip') {
                if (this.tokenList[current].type !== 'condition')
                    current += 1;
                else {
                    node = {
                        type: 'If',
                        condition: this.tokenList[current].value,
                        left: this.tokenList[current - 1],
                        right: this.tokenList[current + 1],
                    }
                    current += 1;
                }
            }
            this.checkCurrent = current;
            return node;
        }
    /*
    Parse key word 'to' 
    */
    parseTo(current) {
        try {
            var tok = this.tokenList[++current];
            var from = this.tokenList[current - 1];
            var to = this.tokenList[current + 1];
            if (from.type !== 'register' || from.value !== '0' ||
                to.type !== 'register') {
                throw new ReferenceError('Unrecognized language');
            } else {
                var node = {
                    type: 'Loop',
                    name: tok.value,
                    from: from,
                    to: to,
                }
                this.checkCurrent = current + 1;
                return node;
            }
        } catch (e) {
            this.HandleError(e);
            throw e;
        }
    }
    /*
    Find a token on a line 
    */
    findToken(current, value) {
            while (this.tokenList[current].type !== 'newLine') {
                if (this.tokenList[current].value === value)
                    return true;
                ++current;
            }
            return false;
        }
    /*
    Parse every token in the list of token
    */
    parseToken(current) {
        var tok = this.tokenList[current];
        var nextTok = this.expectToken(current);
        try {
            if (tok.type === 'keyword') {
                if (tok.value === 'delay' || tok.value === 'key' ||
                    tok.value === 'skip' || tok.value === 'sound') {
                    this.checkCurrent = current;
                    return tok;
                }
                if (nextTok === '(') {
                    if (this.findToken(current, ')') === true)
                        return this.parseExpression(current);
                    else
                        throw new ReferenceError('Unrecognized language');
                } else
                    throw new ReferenceError('Unrecognized language');
            } else if (tok.type === 'number') {
                if (nextTok === 'operation') {
                    return this.parseOperation(current);
                } else {
                    this.checkCurrent = current;
                    return tok;
                }
            } else if (tok.type === 'register') {
                if (nextTok === 'assign') {
                    this.checkCurrent = current;
                    return tok;
                } else if (nextTok === 'operation') {
                    return this.parseOperation(current);
                } else if (nextTok === 'newLine') {
                    this.checkCurrent = current;
                    return tok;
                } else if (nextTok === 'to') {
                    return this.parseTo(current);
                } else if (nextTok === false) {
                    this.checkCurrent = current;
                    return tok;
                } else
                    throw new ReferenceError('Unrecognized language');
            } else if (tok.type === 'if') {
                return this.parseIf(current);
            }
        } catch (e) {
            this.HandleError(e);
            throw e;
        }
    }
    /*
    Construct tokens into meaningful code
    Build AST tree
    */
    parseProgram() {
        var current = 0;
        var node = null;
        var leftNode;
        while (current < this.tokenList.length) {
            if (this.tokenList[current].type === 'newLine')
                this.ast.body.push(this.tokenList[current]);
            else if (this.tokenList[current].type !== 'assign') {
                node = this.parseToken(current);
                current = this.checkCurrent;
                if (this.tokenList[current + 1] !== undefined) {
                    if (this.tokenList[current + 1].type !== 'assign') {
                        this.ast.body.push(node);
                    } else
                        leftNode = node;
                } else
                    this.ast.body.push(node);
            } else {
                var rightNode = this.parseToken(current + 1);
                current = this.checkCurrent;
                var nodeAssign = {
                    type: 'assign',
                    left: leftNode,
                    right: rightNode,
                };
                this.ast.body.push(nodeAssign);
            }
            ++current;
        }
    }
    /*
    Translate chip 8 assembly language into chip 8 opcodes
    */
    generate() {
        for (var i = 0; i < this.ast.body.length; i++) {
            var node = this.ast.body[i];
            if (node.type === 'newLine')
                this.codeString += "\n";
            if (node.name === 'clear') {
                this.codeString += "00E0";
                this.codeBinary.push(0x00);
                this.codeBinary.push(0xE0);
            } else if (node.name === 'return') {
                this.codeString += "00EE";
                this.codeBinary.push(0x00);
                this.codeBinary.push(0xEE);
            } else if (node.name === 'jump') {
                if (node.parameters[0].type === 'number' && node.parameters[0].value.length === 3 &&
                    node.parameters[1] === undefined)
                    this.codeString += "1" + node.parameters[0].value;
                else if ((node.parameters[0].type === 'number' || node.parameters[2].type === 'number') &&
                    (node.parameters[0].value.length === 3 || node.parameters[2].value.length === 3) &&
                    node.parameters[1].type === 'operation') {
                    this.codeString += "B" + node.parameters[0].value;
                } else
                    this.codeString += "Bad opcode";
            } else if (node.name === 'call') {
                if (node.parameters[0].type === 'number' && node.parameters[0].value.length === 3)
                    this.codeString += "2" + node.parameters[0].value;
                else
                    this.codeString += "Bad opcode";
            } else if (node.name === 'draw') {
                if (node.parameters[0].type === 'register' && node.parameters[1].type === 'register' &&
                    node.parameters[2].type === 'number')
                    this.codeString += "D" + node.parameters[0].value + node.parameters[1].value +
                    node.parameters[2].value;
                else
                    this.codeString += "Bad opcode";
            } else if (node.type === 'If') {
                if (node.condition === 'equal') {
                    if (node.right.type === 'number' && node.right.value.length === 2)
                        this.codeString += "3" + node.left.value + node.right.value;
                    else if (node.right.type === 'register')
                        this.codeString += "5" + node.left.value + node.right.value + "0";
                    else if (node.right.type === 'keyword')
                        this.codeString += "E" + node.left.value + "9E";
                    else
                        this.codeString += "Bad opcode";
                } else if (node.condition === 'not') {
                    if (node.right.type === 'number' && node.right.value.length === 2)
                        this.codeString += "4" + node.left.value + node.right.value;
                    else if (node.right.type === 'keyword')
                        this.codeString += "E" + node.left.value + "A1";
                    else if (node.left.type === 'register' && node.right.type === 'register')
                        this.codeString += "9" + node.left.value + node.right.value + "0";
                    else
                        this.codeString += "Bad opcode";
                }
            } else if (node.type === 'assign') {
                if (node.left.type === 'register') {
                    if (node.right.type === 'number' && node.right.value.length === 2)
                        this.codeString += "6" + node.left.value + node.right.value;
                    else if (node.right.type === 'Calculation' && node.right.name === '+' &&
                        (node.right.left.type === 'number' || node.right.right.type === 'number')) {
                        if (node.right.left.type === 'number' && node.right.right.type === 'register')
                            this.codeString += "7" + node.right.right.value + node.right.left.value;
                        else if (node.right.left.type === 'register' && node.right.right.type === 'number')
                            this.codeString += "7" + node.right.left.value + node.right.right.value;
                        else
                            this.codeString += "Bad opcode";
                    } else if (node.right.type === 'register')
                        this.codeString += "8" + node.left.value + node.right.value + "0";
                    else if (node.right.type === 'Calculation' && node.right.name === '|' &&
                        node.right.right.type === 'register' && node.right.left.type === 'register') {
                        if ((node.left.value !== node.right.left.value) && (node.left.value !== node.right.right.value))
                            this.codeString += "Bad opcode";
                        else if (node.left.value !== node.right.right.value)
                            this.codeString += "8" + node.left.value + node.right.right.value + "1";
                        else if (node.left.value !== node.right.left.value)
                            this.codeString += "8" + node.left.value + node.right.left.value + "1";
                        else
                            this.codeString += "8" + node.left.value + node.left.value + "1";
                    } else if (node.right.type === 'Calculation' && node.right.name === '&' &&
                        node.right.right.type === 'register' && node.right.left.type === 'register') {
                        if ((node.left.value !== node.right.left.value) && (node.left.value !== node.right.right.value))
                            this.codeString += "Bad opcode";
                        else if (node.left.value !== node.right.right.value)
                            this.codeString += "8" + node.left.value + node.right.right.value + "2";
                        else if (node.left.value !== node.right.left.value)
                            this.codeString += "8" + node.left.value + node.right.left.value + "2";
                        else
                            this.codeString += "8" + node.left.value + node.left.value + "2";
                    } else if (node.right.type === 'Calculation' && node.right.name === '^' &&
                        node.right.right.type === 'register' && node.right.left.type === 'register') {
                        if ((node.left.value !== node.right.left.value) && (node.left.value !== node.right.right.value))
                            this.codeString += "Bad opcode";
                        else if (node.left.value !== node.right.right.value)
                            this.codeString += "8" + node.left.value + node.right.right.value + "3";
                        else if (node.left.value !== node.right.left.value)
                            this.codeString += "8" + node.left.value + node.right.left.value + "3";
                        else
                            this.codeString += "8" + node.left.value + node.left.value + "3";
                    } else if (node.left.value !== 'i' && node.right.type === 'Calculation' && node.right.name === '+' &&
                        node.right.right.type === 'register' && node.right.left.type === 'register') {
                        if ((node.left.value !== node.right.left.value) && (node.left.value !== node.right.right.value))
                            this.codeString += "Bad opcode";
                        else if (node.left.value !== node.right.right.value)
                            this.codeString += "8" + node.left.value + node.right.right.value + "4";
                        else if (node.left.value !== node.right.left.value)
                            this.codeString += "8" + node.left.value + node.right.left.value + "4";
                        else
                            this.codeString += "8" + node.left.value + node.left.value + "4";
                    } else if (node.right.type === 'Calculation' && node.right.name === '-' &&
                        node.right.right.type === 'register' && node.right.left.type === 'register') {
                        if ((node.left.value !== node.right.left.value) && (node.left.value !== node.right.right.value))
                            this.codeString += "Bad opcode";
                        else if (node.left.value !== node.right.right.value)
                            this.codeString += "8" + node.left.value + node.right.right.value + "5";
                        else if (node.left.value !== node.right.left.value)
                            this.codeString += "8" + node.left.value + node.right.left.value + "7";
                        else
                            this.codeString += "8" + node.left.value + node.left.value + "4";
                    } else if (node.right.type === 'CallExpression' && node.right.name === 'shiftRight') {
                        if (node.right.parameters[0].type === 'register')
                            this.codeString += "8" + node.left.value + node.right.parameters[0].value + "6";
                        else
                            this.codeString += "Bad opcode";
                    } else if (node.right.type === 'CallExpression' && node.right.name === 'shiftLeft') {
                        if (node.right.parameters[0].type === 'register')
                            this.codeString += "8" + node.left.value + node.right.parameters[0].value + "E";
                        else
                            this.codeString += "Bad opcode";
                    } else if (node.left.value === 'i' && node.right.type === 'number')
                        this.codeString += "A" + node.right.value;
                    else if (node.right.type === 'keyword' && node.right.value === 'delay')
                        this.codeString += "F" + node.left.value + "07";
                    else if (node.right.type === 'keyword' && node.right.value === 'key')
                        this.codeString += "F" + node.left.value + "0A";
                    else if (node.right.type === 'CallExpression' && node.right.name === 'rand') {
                        if (node.right.parameters[0].type === 'number')
                            this.codeString += "C" + node.left.value + node.right.parameters[0].value;
                        else
                            this.codeString += "Bad opcode";
                    } else if (node.right.type === 'Calculation' && node.right.name === '+' &&
                        node.left.value === 'i') {
                        if (node.left.value !== node.right.left.value)
                            this.codeString += "F" + node.right.left.value + "1E";
                        else if (node.left.value !== node.right.right.value)
                            this.codeString += "F" + node.right.right.value + "1E";
                        else
                            this.codeString += "Bad opcode";
                    } else if (node.right.type === 'CallExpression' && node.right.name === 'memad' &&
                        node.left.value === 'i') {
                        if (node.right.parameters[0].type === 'register')
                            this.codeString += "F" + node.right.parameters[0].value + "29";
                        else
                            this.codeString += "Bad opcode";
                    }
                } else if (node.left.type === 'keyword') {
                    if (node.left.value === 'delay' && node.right.type === 'register')
                        this.codeString += "F" + node.right.value + "15";
                    else if (node.left.value === 'sound' && node.right.type === 'register')
                        this.codeString += "F" + node.right.value + "18";
                    else
                        this.codeString += "Bad opcode";
                } else if (node.left.type === 'CallExpression' && node.left.name === 'memad') {
                    if (node.left.parameters[0].value === 'i' && node.right.type === 'register')
                        this.codeString += "F" + node.right.value + "33";
                    else if (node.left.parameters[0].value === 'i' && node.right.type === 'Loop')
                        this.codeString += "F" + node.right.to.value + "55";
                    else
                        this.codeString += "Bad opcode";
                } else if (node.right.type === 'CallExpression' && node.right.name === 'memad') {
                    if (node.right.parameters[0].value === 'i' && node.left.type === 'Loop')
                        this.codeString += "F" + node.left.to.value + "65";
                    else
                        this.codeString += "Bad opcode";
                }
            }
        }
    }
}


