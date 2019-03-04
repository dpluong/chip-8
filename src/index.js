
const frontend = new Frontend();
frontend.renderDisplay(new Uint8Array(64 * 32));
const backend = new Chip8Cpu(frontend);
const visualizer = new Visualizer(backend);
frontend.statwaitForCodeInput(code => backend.loadProgram(code));
// Assembler 

class Assembler {
    constructor(code) {
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
        this.tokenList = [];
        this.checkCurrent = 0;
        this.ast = {
            type: 'program',
            body: [],
        };
        this.codeString = "";
        this.codeBinary = [];
    }

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

    isRegister(current) {
    var register = this.splitString[current];
    var re1 = /[0-9]/;
    var re2 = /[a-f]/;
    var char = register.charAt(register.length - 1);
    if ((re1.test(char) === true || re2.test(char) === true || char === 'i')
        && register.length === 2 && register.charAt(0) === 'v')
        return true;
    else
        return false;
}

    tokenize () {
    
    
    // Clean spaces 
    for (var i = this.splitString.length - 1; i >= 0; i--) {
        if (this.splitString[i] === '')
            this.splitString.splice(i, 1);
    }
    
    // Tokenize 
    for (var i = 0; i < this.splitString.length; i++) {
        var token = this.splitString[i];
        if (token.length <= 0) {
            continue;
        }
        if (token === 'newLine')
            this.tokenList.push({type: 'newLine'});
        else if (token === 'openBracket') {
            this.tokenList.push({type: 'punctuation', value: '('});
        }
        else if (token === 'closeBracket') {
            this.tokenList.push({type: 'punctuation', value: ')'});
        }
        else if (token === 'comma') {
            this.tokenList.push({type: 'punctuation', value: ','});
        }
        else if (token === 'add') {
            this.tokenList.push({type: 'operation', value: '+'});
        }
        else if (token === 'subtract') {
            this.tokenList.push({type: 'operation', value: '-'});
        }
        else if (token === 'xor') {
            this.tokenList.push({type: 'operation', value: '^'});
        }
        else if (token === 'or') {
            this.tokenList.push({type: 'operation', value: '|'});
        }
        else if (token === 'and') {
            this.tokenList.push({type: 'operation', value: '&'});
        }
        else if (token === 'assign') {
            this.tokenList.push({type: 'assign', value: '='});
        }
        else if (isNaN(token) === false) {
            this.tokenList.push({type: 'number', value: token});
        }
        else if (token === 'if') {
            this.tokenList.push({type: 'if'})       
        }
        else if (this.isKeyWord(i)) {
            this.tokenList.push({type: 'keyword', value: token});
        }
        else if (this.isRegister(i)) {
            this.tokenList.push({type: 'register', value: token.charAt(token.length - 1)});
        }
        else if (token === 'equal' || token === 'not') {
            this.tokenList.push({type: 'condition', value: token});
        }
        else {
            console.log("token not found");
            break;
        }
    }
}

    

    expectToken(current) {
    var nextToken = this.tokenList[current+1];
    if ((nextToken.type) === 'newLine') {
        return nextToken.type;
}
    else if (nextToken.type === 'punctuation' && nextToken.value === '(')
        return nextToken.value;
    else if (nextToken.type === 'operation')
        return nextToken.type;
    else if (nextToken.type === 'assign')
        return nextToken.type;
    else if (nextToken.value === 'to')
        return nextToken.value;
}

    parseOperation(current) {
    var tok = this.tokenList[++current];
    var tokLeft = this.tokenList[current-1];
    var tokRight = this.tokenList[current+1];
    var node = {
        type: 'Calculation',
        name: tok.value,
        left: tokLeft,
        right: tokRight,
    }
    this.checkCurrent = current + 1;
    return node;
    
}

    parseExpression(current) {
    var tok = this.tokenList[++current];
    var node = {
        type: 'CallExpression',
        name: this.tokenList[current-1].value,
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

    parseIf(current) {
    var node;
    while (this.tokenList[current].value !== 'skip') {
        if (this.tokenList[current].type !== 'condition')
            current += 1;
        else {
            node = {
                type: 'If',
                condition: this.tokenList[current].value,
                left: this.tokenList[current-1],
                right: this.tokenList[current+1],
            }
            current += 1;
        }
    }
    this.checkCurrent = current;
    return node;
}

    parseToken(current) {
    var tok = this.tokenList[current];
    var nextTok = this.expectToken(current);
    if (tok.type === 'keyword') {
        if (nextTok === '(')
            return this.parseExpression(current);
        else {
            this.checkCurrent = current;
            return tok;
        }
    }
    else if (tok.type === 'number') {
        this.checkCurrent = current;
        return tok;
    }
    else if (tok.type === 'register') {
        if (nextTok === '(')
            return this.parseExpression(current)
        else if (nextTok === 'assign') {
            this.checkCurrent = current;
            return tok;
        }
        else if (nextTok === 'operation') {
            return this.parseOperation(current);
        }
        else if (nextTok === 'newLine') {
            this.checkCurrent = current;
            return tok;
        }
        else if (nextTok === 'to') {
            return this.parseKeyWord(current);
        }
    }
    else if (tok.type === 'if') {
        return this.parseIf(current);
    }
}

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
            if (this.tokenList[current+1] !== undefined) {
            if (this.tokenList[current+1].type !== 'assign' ) {
                this.ast.body.push(node);
            }
            else
                leftNode = node;
        }
        else
            this.ast.body.push(node);
        }
        else {
            var rightNode = this.parseToken(current+1);
            current = this.checkCurrent;
            var nodeAssign = { type : 'assign',
            left : leftNode,
            right : rightNode,
            };
    
            this.ast.body.push(nodeAssign);

        }
        ++current;
    }
    
}

    generate () {
    for (var i = 0; i < this.ast.body.length; i++) {
        var node = this.ast.body[i];
        if (node.type === 'newLine')
            this.codeString += "\n";
        if (node.name === 'clear') {
            this.codeString += "00E0";
            this.codeBinary.push(0x00);
            this.codeBinary.push(0xE0);
        }
        else if (node.name === 'return') {
            this.codeString += "00EE";
            this.codeBinary.push(0x00);
            this.codeBinary.push(0xEE);
        }
        else if (node.name === 'jump') {
            if (node.parameters[0].type === 'number' && node.parameters[0].value.length === 3
                && node.parameters[1] === undefined)
                this.codeString += "1" + node.parameters[0].value;
            else if ((node.parameters[0].type === 'number' || node.parameters[2].type === 'number') 
                && (node.parameters[0].value.length === 3 || node.parameters[2].value.length === 3)
                && node.parameters[1].type === 'operation') {
                this.codeString += "B" + node.parameters[0].value;
            }
            else 
                this.codeString += "Bad opcode";
        }
        else if (node.name === 'call') {
            if (node.parameters[0].type === 'number' && node.parameters[0].value.length === 3)
                this.codeString += "2" + node.parameters[0].value;
            else
                this.codeString += "Bad opcode";
        }
        else if (node.type === 'If') {
            if (node.condition === 'equal' ) {
                if (node.right.type === 'number' && node.right.value.length === 2)
                    this.codeString += "3" + node.left.value + node.right.value;
                else if (node.right.type === 'register')
                    this.codeString += "5" + node.left.value + node.right.value + "0";
                else if (node.right.type === 'keyword')
                    this.codeString += "E" + node.left.value + "9E";
                else
                    this.codeString += "Bad opcode";
            }
            else if (node.condition === 'not') {
                if (node.right.type === 'number' && node.right.value.length === 2)
                    this.codeString += "4" + node.left.value + node.right.value;
                else if (node.right.type === 'keyword') 
                    this.codeString += "E" + node.left.value + "A1";
                else
                    this.codeString += "Bad opcode";
            }
        }
        // Unimplemented opcodes translation 
    }
}
}