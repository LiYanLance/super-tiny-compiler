// 把 AST 转化为 new AST
function transformer(ast) {
  let newAst = {
    type: 'Program',
    body: [],
  };

  ast._context = newAst.body;

  // 用 AST 和 visitor 调用 traverser
  traverser(ast, {

    // 第一个 visitor 接收所有的 `NumberLiteral`
    NumberLiteral: {
      // 通过 enter 访问
      enter(node, parent) {
        // 我们会创建一个新的节点, 也叫做 NumberLiteral, 然后把它放入 parent context
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value,
        });
      },
    },

    // 接下来是 `StringLiteral`
    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value,
        });
      },
    },

    // `CallExpression`.
    CallExpression: {
      enter(node, parent) {

        // 创建一个新节点 `CallExpression` 并内嵌一个 `Identifier`.
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: [],
        };

        // 接下来我们在原来的 `CallExpression` 节点上, 定义一个 context 指向 expression 的参数
        node._context = expression.arguments;

        // 如果父节点不是 `CallExpression`
        if (parent.type !== 'CallExpression') {

          // 用 `ExpressionStatement` 包一下 `CallExpression`, 因为 `CallExpression` 在 JS 中是真的语句
          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          };
        }

        // 最后, 把 (包装过的) `CallExpression` 放入 parent 的 context.
        parent._context.push(expression);
      },
    }
  });

  // 返回刚刚生成的 new AST
  return newAst;
}

// 遍历 AST
// 定义一个 traverser 方法接收一个 AST 和 visitor. 内部有两个 functions
function traverser(ast, visitor) {

  // `traverseArray` 可以让我们遍历数组, 并调用我们定义的另一个方法 `traverseNode`
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    });
  }

  // `traverseNode` 接收 `node` 和它的 `parent` 节点. 这样我们就能传 visitor 的两个 methods.
  function traverseNode(node, parent) {

    // 我们首先通过 type 看看 visitor 是否存在方法
    let methods = visitor[node.type];

    // 如果这个节点有 `enter` 方法, 我们就 enter 进入
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    // 接下来，我们将按节点 type 拆分
    switch (node.type) {
      // 从 level `Program` 开始, 它的 body 属性的值是一个 node 的 array, 我们用上面的方法遍历
      // traverseArray 将依次调用 `traverseNode`，所以我们在通过递归对树进行遍历
      case 'Program':
        traverseArray(node.body, node);
        break;
      // 接下来, 我们对 CallExpression 的参数 params 做同样的事
      case 'CallExpression':
        traverseArray(node.params, node);
        break;
      // 遇到没有子节点的 `NumberLiteral` 和 `StringLiteral`, 直接 break 就可以了
      case 'NumberLiteral':
      case 'StringLiteral':
        break;
      // 不认识的节点, 直接报错
      default:
        throw new TypeError(node.type);
    }

    // 如果这个节点有 `exit` 方法, 我们就 exit 回退
    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  // 调用 traverseNode, 传入 AST, AST 的根节点没有 parent 传 null
  return traverseNode(ast, null);
}


module.exports = transformer;
