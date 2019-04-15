function codeGenerator(node) {

  // 通过node 的 type 属性, 把 AST 转为 code
  switch (node.type) {

    // 如果遇到 Program 节点, 就遍历 body 中的每个节点,
    case 'Program':
      return node.body.map(codeGenerator)
        .join('\n');

    // 对于 `ExpressionStatement`, 我们在内嵌表达式中递归的使用代码生成器, 结束后加上分号
    case 'ExpressionStatement':
      return (
        codeGenerator(node.expression) + ';'
      );

    // 如果遇到 `CallExpression`, 就打印 `callee` 和左括号,
    // 把 node 中的 arguments 映射成数组, 用逗号 join 一下, 最后打印一个右括号
    case 'CallExpression':
      return (
        codeGenerator(node.callee) + '(' +  node.arguments.map(codeGenerator).join(', ') + ')'
      );

    // 遇到 `Identifier` 直接返回 `node`'s 名字.
    case 'Identifier':
      return node.name;

    // 对于 `NumberLiteral` 直接返回 `node` 的值.
    case 'NumberLiteral':
      return node.value;

    // 对 `StringLiteral` 给 `node` 的值加上引号.
    case 'StringLiteral':
      return '"' + node.value + '"';

    // 对于其他节点, 报错
    default:
      throw new TypeError(node.type);
  }
}

module.exports = codeGenerator;
