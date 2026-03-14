/** 为每个场景构建 LLM Prompt */
export function buildPrompt(scenario: string, params: Record<string, string | number>): string {
  switch (scenario) {
    case 'city-pk':
      return cityPkPrompt(params)
    case 'career-switch':
      return careerSwitchPrompt(params)
    case 'buy-vs-rent':
      return buyVsRentPrompt(params)
    case 'job-hop':
      return jobHopPrompt(params)
    case 'grad-vs-work':
      return gradVsWorkPrompt(params)
    case 'gap-year':
      return gapYearPrompt(params)
    case 'custom':
      return customPrompt(params)
    default:
      return `场景：${scenario}，参数：${JSON.stringify(params)}。请基于常识和公开数据进行推演。`
  }
}

function cityPkPrompt(p: Record<string, string | number>) {
  return `请对比"${p.city_a}"和"${p.city_b}"这两个城市。
从以下维度进行对比打分(0-100)和叙事推演：生活成本、薪资水平、空气质量、通勤体验、美食指数、文化娱乐。
用第二人称讲述：如果你从${p.city_a}搬到${p.city_b}，你的生活会发生哪些变化？反之呢？
请基于中国城市的真实情况进行分析。chartData 的 datasets 中第一个是${p.city_a}，第二个是${p.city_b}。`
}

function careerSwitchPrompt(p: Record<string, string | number>) {
  return `请分析从"${p.current}"转行到"${p.target}"的可行性。
从以下维度打分(0-100)：技能匹配度、学习成本、市场需求、薪资涨幅、竞争强度、发展前景。
用第二人称讲述一个转行故事：现状→学习阶段→转型期→1年后→3年后。
chartData 中第一个 dataset 是"留在${p.current}"，第二个是"转向${p.target}"。`
}

function buyVsRentPrompt(p: Record<string, string | number>) {
  return `请分析在"${p.city}"，月预算${p.budget}元的情况下，买房 vs 租房的对比。
从以下维度打分(0-100)：5年总成本、10年总成本、生活灵活性、资产增值、压力指数、生活品质。
用第二人称讲述两条路径的未来发展。
chartData 中第一个 dataset 是"买房"，第二个是"租房"。`
}

function jobHopPrompt(p: Record<string, string | number>) {
  return `请分析当前月薪${p.current_salary}元，考虑跳槽到"${p.target_type}"类型公司的决策。
从以下维度打分(0-100)：薪资涨幅、成长空间、工作强度、稳定性、技术深度、跳槽风险。
用第二人称讲述跳槽前后的变化故事。
chartData 中第一个 dataset 是"留在当前公司"，第二个是"跳槽到${p.target_type}"。`
}

function gradVsWorkPrompt(p: Record<string, string | number>) {
  return `请分析"${p.major}"专业、在"${p.city}"的情况下，考研 vs 直接工作的对比。
从以下维度打分(0-100)：3年收入总计、知识深度、人脉资源、就业竞争力、生活压力、长期回报。
用第二人称讲述两条路径的3年发展对比故事。
chartData 中第一个 dataset 是"考研"，第二个是"直接工作"。`
}

function gapYearPrompt(p: Record<string, string | number>) {
  return `请分析存款${p.savings}元，去"${p.destination}"进行Gap Year的可行性。
从以下维度打分(0-100)：预算充足度、签证难度、安全指数、文化体验、生活成本、回归难度。
用第二人称讲述一个Gap Year故事：准备→出发→旅途→回归。
chartData 中第一个 dataset 是"去Gap Year"，第二个是"继续当前生活"。`
}

function customPrompt(p: Record<string, string | number>) {
  const dims = String(p.dimensions || '').split(',').filter(Boolean)
  const contextStr = p.context ? `\n背景信息：${p.context}` : ''
  return `请对比分析"${p.option_a}"和"${p.option_b}"。${contextStr}
从以下维度打分(0-100)并进行对比分析：${dims.join('、')}。
用第二人称讲述两条路径的发展对比故事，分4个阶段。
chartData 中第一个 dataset 是"${p.option_a}"，第二个是"${p.option_b}"。
labels 使用这些维度名：${dims.join('、')}。`
}
