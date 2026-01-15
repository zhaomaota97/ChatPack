'use client'

export function AdminPacks() {
  const packs = [
    { name: '普通卡包', config: '混合', count: 5, opened: 3456 },
    { name: '稀有卡包', config: '100% 稀有', count: 5, opened: 876 },
    { name: '史诗卡包', config: '100% 史诗', count: 5, opened: 234 },
    { name: '传说卡包', config: '100% 传说', count: 5, opened: 56 },
  ]

  return (
    <div>
      <h2 className="text-base mb-4">🎴 卡包管理</h2>

      <div className="mb-4">
        <button
          onClick={() => alert('创建卡包')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer"
        >
          ➕ 创建卡包
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
        {packs.map((pack, index) => (
          <div key={index} className="border border-gray-300 p-4">
            <h3 className="mb-2">{pack.name}</h3>
            <p className="mb-1">稀有度配置: {pack.config}</p>
            <p className="mb-1">
              卡片数量: <strong>{pack.count}</strong>
            </p>
            <p className="mb-1">
              总开包数: <strong>{pack.opened}</strong>
            </p>
            <p className="mb-2">
              状态:{' '}
              <label>
                <input type="checkbox" defaultChecked className="mr-1" /> 启用
              </label>
            </p>
            <button
              onClick={() => alert('编辑')}
              className="px-2.5 py-1 mx-0.5 cursor-pointer"
            >
              编辑
            </button>
            <button
              onClick={() => alert('查看统计')}
              className="px-2.5 py-1 mx-0.5 cursor-pointer"
            >
              统计
            </button>
            <button
              onClick={() => alert('删除')}
              className="px-2.5 py-1 mx-0.5 cursor-pointer"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
