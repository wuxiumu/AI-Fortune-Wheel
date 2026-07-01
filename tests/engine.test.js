/**
 * Engine 单元测试
 * 测试评分引擎的核心算法
 */

// 简单的测试框架
const assert = (condition, message) => {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  }
  console.log('✓ PASS:', message);
};

// 加载依赖
const fs = require('fs');
const vm = require('vm');

// 创建沙箱环境
const sandbox = { console, Math };
vm.createContext(sandbox);

// 加载数据
const dataCode = fs.readFileSync('./js/data.js', 'utf-8');
vm.runInContext(dataCode, sandbox);

// 加载引擎
const engineCode = fs.readFileSync('./js/engine.js', 'utf-8');
vm.runInContext(engineCode, sandbox);

// 提取函数
const { eastResult, westResult, calcResult, elDist, spread, pickN } = sandbox;

console.log('\n=== Engine Unit Tests ===\n');

// 测试五行距离
assert(elDist('木', '火') === 1, '五行相生距离为 1');
assert(elDist('木', '土') === 2, '五行相克距离为 2');
assert(elDist('木', '木') === 0, '同元素距离为 0');
assert(elDist('火', '水') === 2, '火水相克距离为 2');

// 测试东方评分
const eastTest1 = eastResult(0, 1); // 鼠牛六合
assert(eastTest1.tone === 'gold', '鼠牛六合应为金线');
assert(eastTest1.score >= 80, '鼠牛六合分数应 >= 80');

const eastTest2 = eastResult(0, 6); // 鼠马相冲
assert(eastTest2.tone === 'red', '鼠马相冲应为红线');
assert(eastTest2.score <= 50, '鼠马相冲分数应 <= 50');

const eastTest3 = eastResult(0, 0); // 鼠鼠比肩
assert(eastTest3.tone === 'gray', '鼠鼠比肩应为灰线');

// 测试西方评分
const westTest1 = westResult(0, 4); // 白羊狮子三分相
assert(westTest1.tone === 'gold', '白羊狮子三分相应为金线');
assert(westTest1.score >= 80, '白羊狮子分数应 >= 80');

const westTest2 = westResult(0, 6); // 白羊天秤对冲
assert(westTest2.tone === 'red', '白羊天秤对冲应为红线');

const westTest3 = westResult(0, 0); // 白羊白羊同星座
assert(westTest3.tone === 'gold', '同星座应为金线');

// 测试统一入口
const calcEast = calcResult('east', 0, 1);
assert(typeof calcEast === 'object', 'calcResult 应返回对象');
assert(calcEast.score === eastTest1.score, 'calcResult 应与 eastResult 结果一致');

const calcWest = calcResult('west', 0, 4);
assert(typeof calcWest === 'object', 'calcResult 应返回对象');

// 测试确定性
const test1 = calcResult('east', 2, 5);
const test2 = calcResult('east', 2, 5);
assert(test1.score === test2.score, '同一对应始终返回相同分数');

// 测试 spread 函数
const spreadTest = spread(0, 1, -3, 3);
assert(spreadTest >= -3 && spreadTest <= 3, 'spread 应在指定范围内');

// 测试 pickN 函数
const arr = ['a', 'b', 'c', 'd'];
const pickTest = pickN(0, 1, arr);
assert(arr.includes(pickTest), 'pickN 应返回数组中的元素');

console.log('\n✅ All tests passed!\n');
