function parser(tokens) {
  let current = 0;

  // 递归 recursion
  function walk() {
    let token = tokens[current];

    if (token.type === 'number') {
      current++;
      // 数字节点, 直接返回
      return {
        type: 'NumberLiteral',
        value: token.value,
      };
    }

    if (token.type === 'string') {
      current++;
      // 字符串节点, 直接返回
      return {
        type: 'StringLiteral',
        value: token.value,
      };
    }

    // 遇到一个左括号, 调用表达式
    if (
      token.type === 'paren' &&
      token.value === '('
    ) {
      // 创建一个调用节点
      token = tokens[++current];
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };

      token = tokens[++current];
      while (
        (token.type !== 'paren') ||
        (token.type === 'paren' && token.value !== ')')
        ) {
        // 遇到右括号之前, 在这个节点下遍历, 都放入调用参数中.
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }

    throw new TypeError(token.type);
  }

  // AST 根节点
  let ast = {
    type: 'Program',
    body: [],
  };

  while (current < tokens.length) {
    // 遍历所有节点, 添加进去
    ast.body.push(walk());
  }

  return ast;
}

module.exports = parser;