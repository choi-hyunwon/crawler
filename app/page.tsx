"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { supabase } from '../lib/supabaseClient';
import Image from "next/image";
import dynamic from "next/dynamic";
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(""); // 사명 기준
  const [dateFilter, setDateFilter] = useState("전체"); // fetched_at 기준
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase.from('investing_rsi').select('*').order('fetched_at', { ascending: false });
      if (error) setError("데이터를 불러오는 중 오류가 발생했습니다.");
      else setData(data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // fetched_at 값 중복 없이 내림차순 정렬
  const fetchedAtList = Array.from(new Set(data.map(row => row.fetched_at))).sort((a, b) => b.localeCompare(a));

  // 사명, fetched_at 동시 필터링
  const filteredData = data.filter(row => {
    const nameMatch = row.label?.toLowerCase().includes(filter.toLowerCase());
    const dateMatch = dateFilter === "전체" || row.fetched_at === dateFilter;
    return nameMatch && dateMatch;
  });

  // 테이블 헤더 한글화
  const getHeader = (key: string) => {
    if (key === 'label') return '사명';
    if (key === 'rsi_value') return 'RSI(14)';
    if (key === 'fetched_at') return '수집일';
    return key;
  };

  // ECharts 옵션 (사명별 선그래프)
  const nameList = Array.from(new Set(filteredData.map(row => row.label)));
  const dateList = Array.from(new Set(filteredData.map(row => row.fetched_at))).sort();
  const series = nameList.map(name => ({
    name,
    type: 'line',
    data: dateList.map(date => {
      const found = filteredData.find(row => row.label === name && row.fetched_at === date);
      return found ? found.rsi_value : null;
    }),
    // itemStyle: { color: undefined } // 색상 자동
  }));
  const chartOption = {
    title: { text: 'Investing RSI Line Chart', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: nameList, top: 30 },
    xAxis: { type: 'category', data: dateList, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', min: 0, max: 100 },
    series
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h2 className={styles.title}>Investing RSI 리스트</h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <div className={styles.loader}></div>
            <div style={{ marginTop: 16, color: '#888', fontSize: 18 }}>로딩 중...</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <input
                type="text"
                placeholder="사명으로 검색"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ padding: 8, fontSize: 16, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                style={{ padding: 8, fontSize: 16, borderRadius: 6, border: "1px solid #ccc" }}
              >
                <option value="전체">전체</option>
                {fetchedAtList.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
            {error && <div>{error}</div>}
            {filteredData.length === 0 ? (
              <div>데이터가 없습니다.</div>
            ) : (
              <>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>순번</th>
                      {Object.keys(filteredData[0])
                        .filter((key) => key !== 'crawled_at' && key !== 'id')
                        .map((key) => (
                          <th key={key} className={styles.tableHeader}>{getHeader(key)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, idx) => (
                      <tr key={idx}>
                        <td className={styles.tableCell}>{idx + 1}</td>
                        {Object.entries(row)
                          .filter(([key]) => key !== 'crawled_at' && key !== 'id')
                          .map(([_, val], i) => (
                            <td key={i} className={styles.tableCell}>{val as string}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Bar 차트 */}
                <div style={{ width: '100%', maxWidth: 700, margin: '40px auto 0' }}>
                  <ReactECharts option={chartOption} style={{ height: 400, width: '100%' }} />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
