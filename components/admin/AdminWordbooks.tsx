'use client'

export function AdminWordbooks() {
  const wordbooks = [
    { name: '🌱 小学词汇', code: 'PRIMARY', count: 500 },
    { name: '🌿 初中词汇', code: 'MIDDLE', count: 800 },
    { name: '🌳 高中词汇', code: 'HIGH', count: 1200 },
    { name: '🎓 四级词汇', code: 'CET4', count: 1500 },
    { name: '🏆 六级词汇', code: 'CET6', count: 1800 },
    { name: '👑 考研词汇', code: 'POSTGRADUATE', count: 2000 },
  ]

  return (
    <div>
      <h2 className="text-base mb-4">📚 单词书管理</h2>

      <div className="grid grid-cols-3 gap-2.5">
        {wordbooks.map((book, index) => (
          <div key={index} className="border border-gray-300 p-4">
            <h3 className="mb-2">{book.name}</h3>
            <p className="mb-1">{book.code}</p>
            <p className="mb-1">
              单词数: <strong>{book.count}</strong>
            </p>
            <p className="mb-2">
              状态:{' '}
              <label>
                <input type="checkbox" defaultChecked className="mr-1" /> 启用
              </label>
            </p>
            <button
              onClick={() => alert('管理单词')}
              className="px-2.5 py-1 mx-0.5 cursor-pointer"
            >
              管理单词
            </button>
            <button
              onClick={() => alert('编辑')}
              className="px-2.5 py-1 mx-0.5 cursor-pointer"
            >
              编辑
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
