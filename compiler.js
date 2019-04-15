const tokenizer = require('./src/tokenizer');
const parser = require('./src/parser');
const transformer = require('./src/transformer');
const codeGenerator = require('./src/codeGenerator');

/**
  *   1. input  => tokenizer   => tokens
  *   2. tokens => parser      => ast
  *   3. ast    => transformer => newAst
  *   4. newAst => generator   => output
**/

function compiler(input) {
  let tokens = tokenizer(input);
  let ast    = parser(tokens);
  let newAst = transformer(ast);
  let output = codeGenerator(newAst);

  // and simply return the output!
  return output;
}


const input = "(add 2 (sub 4 2))";

const res = compiler(input);

console.log(res);