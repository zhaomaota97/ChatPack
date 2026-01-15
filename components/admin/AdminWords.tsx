'use client'

import { RarityBadge } from '../common/RarityBadge'

export function AdminWords() {
  return (
    <div>
      <h2 className="text-base mb-4">📝 单词管理</h2>

      <div className="mb-4">
        <button
          onClick={() => alert('打开添加单词对话框')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer"
        >
          ➕ 添加单词
        </button>
        <button
          onClick={() => alert('打开批量导入对话框')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer ml-1"
        >
          📥 批量导入
        </button>
        <button
          onClick={() => alert('下载模板')}
          className="px-2.5 py-1 mx-0.5 cursor-pointer ml-1"
        >
          📄 下载模板
        </button>
      </div>

      <div className="mb-4 p-2.5 border border-gray-300">
        <input
          type="text"
          placeholder="搜索单词或释义..."
          className="w-[200px] px-2 py-1"
        />
        <select className="px-2 py-1 ml-2.5">
          <option value="">全部稀有度</option>
          <option>COMMON</option>
          <option>RARE</option>
          <option>EPIC</option>
          <option>LEGENDARY</option>
        </select>
        <select className="px-2 py-1 ml-2.5">
          <option value="">全部单词书</option>
          <option>小学词汇</option>
          <option>初中词汇</option>
          <option>高中词汇</option>
        </select>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2.5">搜索</button>
      </div>

      <table className="w-full border-collapse mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">单词</th>
            <th className="border border-gray-300 p-2">释义</th>
            <th className="border border-gray-300 p-2">音标</th>
            <th className="border border-gray-300 p-2">稀有度</th>
            <th className="border border-gray-300 p-2">所属单词书</th>
            <th className="border border-gray-300 p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">hello</td>
            <td className="border border-gray-300 p-2">你好</td>
            <td className="border border-gray-300 p-2">/həˈləʊ/</td>
            <td className="border border-gray-300 p-2">
              <RarityBadge rarity="COMMON" />
            </td>
            <td className="border border-gray-300 p-2">小学词汇</td>
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => alert('编辑')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                编辑
              </button>
              <button
                onClick={() => alert('删除')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                删除
              </button>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">beautiful</td>
            <td className="border border-gray-300 p-2">美丽的</td>
            <td className="border border-gray-300 p-2">/ˈbjuːtɪfl/</td>
            <td className="border border-gray-300 p-2">
              <RarityBadge rarity="RARE" />
            </td>
            <td className="border border-gray-300 p-2">初中词汇</td>
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => alert('编辑')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                编辑
              </button>
              <button
                onClick={() => alert('删除')}
                className="px-2.5 py-1 mx-0.5 cursor-pointer"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-4">
        显示 1-2 / 总共 5000 条
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer ml-2">上一页</button>
        <button className="px-2.5 py-1 mx-0.5 cursor-pointer">下一页</button>
      </p>
    </div>
  )
}
