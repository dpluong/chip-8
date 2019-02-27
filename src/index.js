
const frontend = new Frontend();
frontend.renderDisplay(new Uint8Array(64 * 32));
const backend = new Chip8Cpu(frontend);
const visualizer = new Visualizer(backend);
frontend.statwaitForCodeInput(code => backend.loadProgram(code));
// Assembler 

// An array contain a list of tokens
var tokenList = [];

// Check if a token is a keyword or not
function isKeyWord(current, splitString) {
    var keyWord = splitString[current];
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

// Check if a token is a register or not 
function isRegister(current, splitString) {
    var register = splitString[current];
    var re1 = /[0-9]/;
    var re2 = /[a-f]/;
    var char = register.charAt(register.length - 1);
    if ((re1.test(char) === true || re2.test(char) === true || char === 'i')
        && register.length === 2 && register.charAt(0) === 'v')
        return true;
    else
        return false;
}

// A function that receive a string of assembly language and split it 
// into small meaningful chunks (tokens)
function tokenize (code) {
	var splitString = code
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
    
    // Clean spaces 
    for (var i = splitString.length - 1; i >= 0; i--) {
    	if (splitString[i] === '')
    		splitString.splice(i, 1);
    }
    
    // Tokenize 
	for (var i = 0; i < splitString.length; i++) {
    	var token = splitString[i];
        if (token.length <= 0) {
        	continue;
        }
        if (token === 'newLine')
        	tokenList.push({type: 'newLine'});
        else if (token === 'openBracket') {
        	tokenList.push({type: 'punctuation', value: '('});
        }
        else if (token === 'closeBracket') {
        	tokenList.push({type: 'punctuation', value: ')'});
        }
        else if (token === 'comma') {
        	tokenList.push({type: 'punctuation', value: ','});
        }
        else if (token === 'add') {
        	tokenList.push({type: 'operation', value: '+'});
        }
        else if (token === 'subtract') {
        	tokenList.push({type: 'operation', value: '-'});
        }
        else if (token === 'xor') {
        	tokenList.push({type: 'operation', value: '^'});
        }
        else if (token === 'or') {
        	tokenList.push({type: 'operation', value: '|'});
        }
        else if (token === 'and') {
        	tokenList.push({type: 'operation', value: '&'});
        }
        else if (token === 'assign') {
        	tokenList.push({type: 'assign', value: '='});
        }
        else if (isNaN(token) === false) {
            tokenList.push({type: 'number', value: token});
        }
        else if (token === 'if') {
        	tokenList.push({type: 'if'})       
        }
        else if (isKeyWord(i, splitString)) {
        	tokenList.push({type: 'keyword', value: token});
        }
        else if (isRegister(i, splitString)) {
        	tokenList.push({type: 'register', value: token.charAt(token.length - 1)});
        }
        else if (token === 'equal' || token === 'not') {
        	tokenList.push({type: 'condition', value: token});
        }
        else {
        	console.log("token not found");
        	break;
        }
    }
    return tokenList;
}

// Keep track of index of tokens
var checkCurrent = 0;
function passCurrent(current) {
	checkCurrent = current;
}

// Check what the next token is
function expectToken(current) {
	var nextToken = tokenList[current+1];
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

// Parse the operations like "+, -, ^, &, |"
function parseOperation(current) {
	var tok = tokenList[++current];
	var tokLeft = tokenList[current-1];
    var tokRight = tokenList[current+1];
    var node = {
    	type: 'Calculation',
    	name: tok.value,
    	left: tokLeft,
    	right: tokRight,
    }
    passCurrent(current+1);
    return node;
    
}

// Parse the key words
function parseKeyWord(current) {
	var node = {
    	type: 'Loop',
    	name: tok.value,
    	from: tokenList[current-1],
    	to: tokenList[current+1],
    	}
    passCurrent(current+1);
    return node;
}

// Parse function 
function parseExpression(current) {
    var tok = tokenList[++current];
    var node = {
		type: 'CallExpression',
		name: tokenList[current-1].value,
		parameters: [],
	}
	tok = tokenList[++current];
    if (tok.value !== ')') {
		while (!(tok.value === ')')) {
		if (tok.value === ',') {
			
			tok = tokenList[++current];
		}
	    node.parameters.push(tokenList[current]);
		tok = tokenList[++current];
	}
	}
	passCurrent(current);
    return node;
}

// Parse If
function parseIf(current) {
	var node;
	while (tokenList[current].value !== 'skip') {
		if (tokenList[current].type !== 'condition')
			current += 1;
		else {
			node = {
				type: 'If',
				condition: tokenList[current].value,
				left: tokenList[current-1],
				right: tokenList[current+1],
			}
			current += 1;
        }
	}
	passCurrent(current);
	return node;
}
	
// Parse every token in token list
function parseToken(current) {
	var tok = tokenList[current];
	var nextTok = expectToken(current);
	if (tok.type === 'keyword') {
		if (nextTok === '(')
			return parseExpression(current);
		else {
			passCurrent(current);
			return tok;
		}
	}
	else if (tok.type === 'number') {
		passCurrent(current);
		return tok;
	}
	else if (tok.type === 'register') {
		if (nextTok === '(')
			return parseExpression(current)
		else if (nextTok === 'assign') {
			passCurrent(current);
			return tok;
		}
		else if (nextTok === 'operation') {
			return parseOperation(current);
		}
		else if (nextTok === 'newLine') {
			passCurrent(current);
			return tok;
		}
		else if (nextTok === 'to') {
			return parseKeyWord(current);
		}
	}
	else if (tok.type === 'if') {
		return parseIf(current);
	}
}

// Create an AST tree 
var ast = {
		type: 'program',
		body: [],
	};

// Parse the whole program 
function parseProgram(tokenList) {
	var current = 0;
	var node = null;
	var leftNode;
    while (current < tokenList.length) {
    	if (tokenList[current].type === 'newLine')
    		ast.body.push(tokenList[current]);
    	else if (tokenList[current].type !== 'assign') {
    		node = parseToken(current);
    		current = checkCurrent;
    		if (tokenList[current+1] !== undefined) {
    		if (tokenList[current+1].type !== 'assign' ) {
    			ast.body.push(node);
    		}
    		else
    			leftNode = node;
    	}
    	else
    		ast.body.push(node);
    	}
    	else {
    		var rightNode = parseToken(current+1);
    		current = checkCurrent;
    		var nodeAssign = { type : 'assign',
    		left : leftNode,
    		right : rightNode,
    		};
    
    		ast.body.push(nodeAssign);

    	}
    	++current;
    }
    return ast;
}

// Create a string of opcodes
var codeString = "";

// Create an array of opcodes
var codeBinary = [];

// A function that goes to each node of AST tree and translate that node to an opcode
function generate (ast) {
	for (var i = 0; i < ast.body.length; i++) {
		var node = ast.body[i];
		if (node.type === 'newLine')
			codeString += "\n";
		if (node.name === 'clear') {
			codeString += "00E0";
			codeBinary.push(0x00E0);
		}
		else if (node.name === 'return') {
			codeString += "00EE";
			codeBinary.push(0x00EE);
		}
		else if (node.name === 'jump') {
			if (node.parameters[0].type === 'number' && node.parameters[0].value.length === 3
				&& node.parameters[1] === undefined)
				codeString += "1" + node.parameters[0].value;
			else if ((node.parameters[0].type === 'number' || node.parameters[2].type === 'number') 
				&& (node.parameters[0].value.length === 3 || node.parameters[2].value.length === 3)
				&& node.parameters[1].type === 'operation') {
				codeString += "B" + node.parameters[0].value;
			}
			else 
				codeString += "Bad opcode";
		}
		else if (node.name === 'call') {
			if (node.parameters[0].type === 'number' && node.parameters[0].value.length === 3)
				codeString += "2" + node.parameters[0].value;
			else
				codeString += "Bad opcode";
		}
		else if (node.type === 'If') {
			if (node.condition === 'equal' ) {
				if (node.right.type === 'number' && node.right.value.length === 2)
					codeString += "3" + node.left.value + node.right.value;
				else if (node.right.type === 'register')
					codeString += "5" + node.left.value + node.right.value + "0";
				else if (node.right.type === 'keyword')
					codeString += "E" + node.left.value + "9E";
				else
					codeString += "Bad opcode";
			}
			else if (node.condition === 'not') {
				if (node.right.type === 'number' && node.right.value.length === 2)
					codeString += "4" + node.left.value + node.right.value;
				else if (node.right.type === 'keyword') 
					codeString += "E" + node.left.value + "A1";
				else
					codeString += "Bad opcode";
			}
		}
		// Unimplemented opcodes translation 
	}
	return codeString;
}
