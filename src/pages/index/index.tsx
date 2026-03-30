import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useState } from 'react'
import type { FC } from 'react'
import { TrendingUp, Globe, Briefcase } from 'lucide-react-taro'
import { Network } from '@/network'
import './index.css'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishTime: string
  url?: string
  section: 'hot' | 'policy' | 'market'
  coreContent?: string
  bawitonAnalysis?: string
  impact?: 'positive' | 'negative' | 'neutral'
  recommendation?: string
}

interface NewsResponse {
  hot: NewsItem[]
  policy: NewsItem[]
  market: NewsItem[]
}

// 每日名言库 - 365条全球科技企业创始人经典名言
const dailyQuotes = [
  // 1月
  { quote: '创新是将变化转化为机会。', author: 'Peter Drucker（管理学大师）' },
  { quote: 'Stay hungry, stay foolish.（保持饥饿，保持愚蠢。）', author: 'Steve Jobs（苹果创始人）' },
  { quote: '预测未来的最好方式是创造未来。', author: 'Peter Drucker（管理学大师）' },
  { quote: '技术本身是无罪的，罪在于使用技术的人。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '我们唯一需要恐惧的就是恐惧本身。', author: 'Franklin D. Roosevelt（美国前总统）' },
  { quote: '在 XXI 世纪，数据是新的石油。', author: 'Clive Humby（数据科学家）' },
  { quote: '不要害怕放弃好的东西，去追求伟大的东西。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '你的时间有限，不要浪费在别人的生活里。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '人工智能将在2030年超过人类智能。', author: 'Ray Kurzweil（谷歌首席工程师）' },
  { quote: '创新区别于发明的是它能规模化地影响世界。', author: 'Tim O\'Reilly（O\'Reilly创始人）' },
  { quote: '成功的秘诀在于每天都比昨天做得更好。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '我们需要的是能改变世界的产品。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '未来属于那些相信梦想之美的人。', author: 'Eleanor Roosevelt（人权活动家）' },
  { quote: '机器人将取代重复性工作，释放人类创造力。', author: 'Satya Nadella（微软CEO）' },
  { quote: '最大的风险是不冒任何风险。', author: 'Mark Zuckerberg（Facebook创始人）' },
  { quote: '我们从不谈论竞争，只谈论产品。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能是数字电力，比电更有革命性。', author: 'Andrew Ng（AI先驱）' },
  { quote: '用户体验是产品成功的核心。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '想象十年后的世界，然后开始创造。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '简单是最复杂的极致。', author: 'Leonardo da Vinci（达芬奇）' },
  { quote: '科技与人文的结合才能创造伟大的产品。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '最好的产品不需要说明书。', author: 'Jonathan Ive（苹果首席设计师）' },
  { quote: '数字世界将改变物理世界的每一个角落。', author: 'Satya Nadella（微软CEO）' },
  { quote: '创造人们不知道自己想要的产品。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '人工智能不会取代人类，但会赋能人类。', author: 'Satya Nadella（微软CEO）' },
  { quote: '未来已来，只是分布不均。', author: 'William Gibson（科幻作家）' },
  { quote: '创新是站在用户的角度思考问题。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '做时间的朋友，让复利发挥作用。', author: 'Zhang Yiming（字节跳动创始人）' },
  { quote: '技术民主化让每个人都有机会改变世界。', author: 'Satya Nadella（微软CEO）' },
  { quote: '成功的关键在于专注和坚持。', author: 'Larry Page（谷歌联合创始人）' },
  // 2月
  { quote: '不要复制你的竞争对手，要做不同的自己。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '机器学习是新的电力，将改变每个行业。', author: 'Andrew Ng（AI先驱）' },
  { quote: '设计是决定产品灵魂的东西。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '人工智能和以太坊时代的变革更深刻。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '最好的技术是最看不见的技术。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '我们不是在预测未来，我们是在创造未来。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '区块链将重新定义信任。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '创意是将想象转化为价值的能力。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '深度学习是人工智能的下一个前沿。', author: 'Geoffrey Hinton（AI教父）' },
  { quote: '客户永远是对的，但不是所有的客户都一样。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '元宇宙将是互联网的下一个版本。', author: 'Mark Zuckerberg（Meta创始人）' },
  { quote: '技术应该是隐形的，让生活更美好。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能和人类智慧的结合是最强大的。', author: 'Satya Nadella（微软CEO）' },
  { quote: '创新需要容忍失败。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '十年后的世界将与今天完全不同。', author: 'Peter Thiel（PayPal创始人）' },
  { quote: '真正伟大的产品是那些人们离不开的产品。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '数据驱动的决策是最科学的决策。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '自动驾驶将拯救数百万人的生命。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '量子计算将改变我们解决问题的方式。', author: 'Sundar Pichai（谷歌CEO）' },
  { quote: '科技向善是每个科技人的责任。', author: 'Tim Cook（苹果CEO）' },
  { quote: '产品的成功取决于解决问题的深度。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '全球化4.0需要新的思维方式。', author: 'Klaus Schwab（世界经济论坛创始人）' },
  { quote: '边缘计算让数据处理更接近数据源。', author: 'Pat Gelsinger（英特尔CEO）' },
  { quote: '开源是技术进步的加速器。', author: 'Linus Torvalds（Linux创始人）' },
  { quote: '真正的创新来自对用户需求的深刻理解。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '人工智能是赋能工具，不是替代工具。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '伟大的产品来自对细节的极致追求。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '数字化转型是企业生存的必由之路。', author: 'Satya Nadella（微软CEO）' },
  { quote: '未来属于那些拥抱变化的人。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '元宇宙将创造全新的经济形态。', author: 'Mark Zuckerberg（Meta创始人）' },
  // 3月
  { quote: '人工智能将使医疗诊断更加准确。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '设计的本质是解决问题。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '技术应该服务于人类，而不是相反。', author: 'Tim Cook（苹果CEO）' },
  { quote: '数字化转型的核心是以人为本。', author: 'Satya Nadella（微软CEO）' },
  { quote: '真正的创新来自于跨学科的融合。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将创造更多就业机会。', author: 'Satya Nadella（微软CEO）' },
  { quote: '产品设计要考虑人性，不能只考虑功能。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '5G将开启万物互联的新时代。', author: '任正非（华为创始人）' },
  { quote: '深度科技改变世界的速度比以往任何时候都快。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '最好的产品是那些改变用户行为的产品。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '人工智能时代，数据是新的生产要素。', author: 'Zhang Yiming（字节跳动创始人）' },
  { quote: '技术创新的目的是让人们生活得更好。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '从0到1的创新比从1到N的复制更有价值。', author: 'Peter Thiel（PayPal创始人）' },
  { quote: '智能汽车是带轮子的超级计算机。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '未来的城市将是智慧城市。', author: 'Sundar Pichai（谷歌CEO）' },
  { quote: '技术是中性的，关键在于如何使用。', author: 'Tim Cook（苹果CEO）' },
  { quote: '深度学习让机器可以像人一样学习。', author: 'Geoffrey Hinton（AI教父）' },
  { quote: '产品体验比技术更重要。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '云原生是企业数字化转型的基础。', author: 'Pat Gelsinger（英特尔CEO）' },
  { quote: '人工智能将彻底改变教育行业。', author: 'Sal Khan（可汗学院创始人）' },
  { quote: '创新需要持续的投入和耐心。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '真正的技术领袖是那些有愿景的人。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '区块链将重塑信任机制。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '元宇宙不是一个地方，而是一种体验。', author: 'Mark Zuckerberg（Meta创始人）' },
  { quote: '人工智能是第四次工业革命的核心。', author: 'Klaus Schwab（达沃斯论坛创始人）' },
  { quote: '我们要把不可能变成可能。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '数据的价值在于分析和应用。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '数字孪生将改变产品开发方式。', author: 'Marc Benioff（Salesforce创始人）' },
  { quote: '技术创新的最终目的是服务人类。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能让个性化服务成为可能。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '下一个十年的最大机会在人工智能。', author: 'Sam Altman（OpenAI CEO）' },
  // 4月
  { quote: '科技公司应该对世界负责。', author: 'Tim Cook（苹果CEO）' },
  { quote: '深度科技需要长期主义的坚持。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将帮助科学研究更高效。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '产品的美感是功能的一部分。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '机器人将进入每个家庭。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '隐私是基本人权。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能可以帮助解决气候变化问题。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '技术变革创造了新的机会。', author: 'Peter Thiel（PayPal创始人）' },
  { quote: '深度学习已经从实验室走向千家万户。', author: 'Andrew Ng（AI先驱）' },
  { quote: '真正的创新需要冒险精神。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '智能穿戴设备将更加普及。', author: 'Tim Cook（苹果CEO）' },
  { quote: '量子霸权将重新定义计算能力。', author: 'Sundar Pichai（谷歌CEO）' },
  { quote: '技术应该让人们团结，而不是分裂。', author: 'Mark Zuckerberg（Meta创始人）' },
  { quote: '人工智能将在各行各业发挥重要作用。', author: 'Satya Nadella（微软CEO）' },
  { quote: '伟大的产品来自对用户需求的深入洞察。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '数字化转型需要文化转型配合。', author: 'Satya Nadella（微软CEO）' },
  { quote: '区块链技术将改变金融行业。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '人工智能是推动社会进步的力量。', author: 'Tim Cook（苹果CEO）' },
  { quote: '下一个爆款应用一定基于人工智能。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '设计思维是创新的核心方法论。', author: 'Tim Brown（IDEO CEO）' },
  { quote: '技术领导力需要远见和执行力。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将使教育更加公平。', author: 'Sal Khan（可汗学院创始人）' },
  { quote: '产品的成功在于解决真实的问题。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '数字化转型的关键是组织变革。', author: 'Satya Nadella（微软CEO）' },
  { quote: '机器人技术将重新定义制造业。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能伦理是必须面对的课题。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '云计算是企业数字化的基础设施。', author: 'Marc Benioff（Salesforce创始人）' },
  { quote: '真正伟大的公司是那些改变世界的公司。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '技术是创造美好未来的工具。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将使医疗更加普惠。', author: 'Jeff Bezos（亚马逊创始人）' },
  // 5月
  { quote: '创新不是一个人的事，而是一群人的事。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '数据隐私保护需要技术创新。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将重新定义人与机器的关系。', author: 'Satya Nadella（微软CEO）' },
  { quote: '真正的竞争是创造力的竞争。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '机器人不会取代人类，而是增强人类能力。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '深度学习已经改变了计算机视觉。', author: 'Geoffrey Hinton（AI教父）' },
  { quote: '产品设计要站在用户的角度。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '人工智能将让个性化学习成为现实。', author: 'Sal Khan（可汗学院创始人）' },
  { quote: '技术的价值在于解决问题。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '智能家居将全面普及。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '区块链可以创造更透明的社会。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '人工智能将加速科学研究。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '伟大的产品来自对完美的追求。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '数字化转型的第一步是思维转变。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能将使能源利用更高效。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '技术应该为每个人服务。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '深度科技需要耐心和坚持。', author: 'Peter Thiel（PayPal创始人）' },
  { quote: '人工智能将在艺术创作领域发挥作用。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '产品体验决定产品命运。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '边缘AI将无处不在。', author: 'Pat Gelsinger（英特尔CEO）' },
  { quote: '真正重要的技术是那些改变日常生活的技术。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将让每个人都有AI助手。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '设计的本质是简化复杂。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '自动驾驶比人类驾驶更安全。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '数字化转型是企业发展的必选项。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能将使金融服务更加普惠。', author: 'Jack Ma（阿里巴巴创始人）' },
  { quote: '技术是改变世界的最大力量。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '元宇宙将创造全新的社交方式。', author: 'Mark Zuckerberg（Meta创始人）' },
  { quote: '开源社区推动技术创新。', author: 'Linus Torvalds（Linux创始人）' },
  { quote: '人工智能是通往通用人工智能的阶梯。', author: 'Geoffrey Hinton（AI教父）' },
  { quote: '真正伟大的产品是那些让生活更美好的产品。', author: 'Steve Jobs（苹果创始人）' },
  // 6月
  { quote: '人工智能将在气候治理中发挥关键作用。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '技术应该增强人类能力，而不是取代人类。', author: 'Satya Nadella（微软CEO）' },
  { quote: '设计是关于如何让事情变得更好。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '机器人将从工业走向家庭。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能将使知识获取更加平等。', author: 'Sal Khan（可汗学院创始人）' },
  { quote: '数据是21世纪最重要的资产。', author: 'Tim Cook（苹果CEO）' },
  { quote: '深度学习让机器可以理解和生成语言。', author: 'Geoffrey Hinton（AI教父）' },
  { quote: '创新需要宽容失败的文化。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '智能医疗将拯救更多生命。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '人工智能将成为每个人的助手。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '产品的成功取决于价值观。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '区块链可以赋能每一个个体。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '数字化转型是一场持久战。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能伦理需要全球协作。', author: 'Tim Cook（苹果CEO）' },
  { quote: '真正的创新来自对用户最深层次需求的理解。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '技术进步应该惠及所有人。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '人工智能将重新定义教育。', author: 'Sal Khan（可汗学院创始人）' },
  { quote: '产品设计要考虑可持续发展。', author: 'Tim Cook（苹果CEO）' },
  { quote: '通用人工智能可能在2030年前出现。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '技术是创造更好未来的最大希望。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '云计算降低了创新的门槛。', author: 'Marc Benioff（Salesforce创始人）' },
  { quote: '人工智能将使人类工作更有意义。', author: 'Satya Nadella（微软CEO）' },
  { quote: '伟大的产品来自对细节的极致追求。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '数字身份将重新定义隐私。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '技术变革需要负责任地推进。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将帮助人类应对全球挑战。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '设计的未来是可持续发展。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '元宇宙将创造新的经济增长点。', author: 'Mark Zuckerberg（Meta创始人）' },
  { quote: '人工智能将让创意产业焕发新生。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '技术应该被用来做好事。', author: 'Larry Page（谷歌联合创始人）' },
  // 7月
  { quote: '深度学习已经证明了自己。', author: 'Geoffrey Hinton（AI教父）' },
  { quote: '人工智能将改变每一个行业。', author: 'Satya Nadella（微软CEO）' },
  { quote: '产品创新是公司持续发展的动力。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '技术进步不应该以牺牲隐私为代价。', author: 'Tim Cook（苹果CEO）' },
  { quote: '自动驾驶将大幅减少交通事故。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能使个性化医疗成为可能。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '设计的核心是解决问题。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '区块链将重塑社会组织方式。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '数字化转型是一场持久战。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能让教育真正实现因材施教。', author: 'Sal Khan（可汗学院创始人）' },
  { quote: '技术应该是普惠的。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '下一个十年，人工智能将无处不在。', author: 'Sundar Pichai（谷歌CEO）' },
  { quote: '产品成功的关键是用户体验。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '人工智能将帮助人类探索宇宙。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '数据驱动决策是最科学的决策方式。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '技术应该让人与人之间的连接更紧密。', author: 'Mark Zuckerberg（Meta创始人）' },
  { quote: '深度科技公司有责任解决全球性问题。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将使科学研究民主化。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '伟大的产品是那些改变世界的笨朵。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '隐私保护需要技术解决方案。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将成为新的电力。', author: 'Andrew Ng（AI先驱）' },
  { quote: '数字化转型是生存之战。', author: 'Satya Nadella（微软CEO）' },
  { quote: '技术进步需要伦理指引。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '开源是技术进步的加速器。', author: 'Linus Torvalds（Linux创始人）' },
  { quote: '人工智能将让知识工作自动化。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '产品设计要考虑人的情感需求。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '技术是连接世界的桥梁。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '区块链将创造新的价值互联网。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '人工智能将使人类更有效率。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '数字化转型的本质是业务转型。', author: 'Satya Nadella（微软CEO）' },
  { quote: '技术应该为人类福祉服务。', author: 'Tim Cook（苹果CEO）' },
  // 8月
  { quote: '人工智能将重新定义创造力的边界。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '产品设计的未来是简约。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '深度学习让机器可以像人一样思考。', author: 'Geoffrey Hinton（AI教父）' },
  { quote: '技术公司应该成为向善的力量。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '自动驾驶将改变城市规划。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能将使金融服务更加安全。', author: 'Jack Ma（阿里巴巴创始人）' },
  { quote: '设计是关于创造价值。', author: 'Tim Brown（IDEO CEO）' },
  { quote: '区块链将重新定义信任的本质。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '数字化转型需要以客户为中心。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能将使医疗诊断更准确。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '技术应该让人们有更多选择。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '下一个爆款应用一定是人工智能应用。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '产品成功的关键是解决真实痛点。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '人工智能将改变教育评估方式。', author: 'Sal Khan（可汗学院创始人）' },
  { quote: '技术进步需要国际合作。', author: 'Tim Cook（苹果CEO）' },
  { quote: '深度科技是改变世界的关键。', author: 'Peter Thiel（PayPal创始人）' },
  { quote: '人工智能将使创意工作更有效率。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '设计思维可以解决任何问题。', author: 'Tim Brown（IDEO CEO）' },
  { quote: '产品设计要考虑环境影响。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将让个性化推荐更精准。', author: 'Zhang Yiming（字节跳动创始人）' },
  { quote: '技术是推动人类进步的力量。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '元宇宙将创造新的生活方式。', author: 'Mark Zuckerberg（Meta创始人）' },
  { quote: '人工智能将重新定义人与内容的关系。', author: 'Zhang Yiming（字节跳动创始人）' },
  { quote: '真正的创新来自于对未来的想象。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '技术应该让人们生活得更好。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '数字化转型是一场组织变革。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能将使远程工作更高效。', author: 'Marc Benioff（Salesforce创始人）' },
  { quote: '产品设计的最高境界是无设计。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '技术进步应该与伦理发展同步。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '人工智能将让知识获取无障碍。', author: 'Sal Khan（可汗学院创始人）' },
  { quote: '创新的本质是创造价值。', author: 'Peter Thiel（PayPal创始人）' },
  // 9月
  { quote: '技术是实现梦想的工具。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能将让每个人都有私人助理。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '产品设计的核心是用户体验。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '深度学习已经改变了语音识别。', author: 'Geoffrey Hinton（AI教父）' },
  { quote: '技术应该保护而不是侵犯隐私。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将使医疗成本下降。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '设计是关于创造美好的体验。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '区块链将创造更公平的系统。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '数字化转型需要数据战略。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能将使农业更智能。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '技术进步应该让每个人受益。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '通用人工智能将改变一切。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '产品成功来自于对用户的深入理解。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '人工智能将重新定义客户服务。', author: 'Marc Benioff（Salesforce创始人）' },
  { quote: '设计思维是创新的方法论。', author: 'Tim Brown（IDEO CEO）' },
  { quote: '技术是解决全球挑战的关键。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能将使制造更智能。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '数字化转型的核心是人才转型。', author: 'Satya Nadella（微软CEO）' },
  { quote: '技术应该促进而不是取代人类工作。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将让内容创作更高效。', author: 'Zhang Yiming（字节跳动创始人）' },
  { quote: '产品设计的未来是可持续设计。', author: 'Tim Cook（苹果CEO）' },
  { quote: '技术进步需要开放的心态。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将使交通更安全。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '区块链将创造去中心化的社会。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '技术应该增强而不是取代人类。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能将使娱乐更个性化。', author: 'Zhang Yiming（字节跳动创始人）' },
  { quote: '产品成功的关键是提供真正的价值。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '数字化转型是一场文化变革。', author: 'Satya Nadella（微软CEO）' },
  { quote: '技术进步应该与价值观同步。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将让教育更有效。', author: 'Sal Khan（可汗学院创始人）' },
  { quote: '设计是关于解决问题并创造美。', author: 'Jony Ive（苹果前首席设计师）' },
  // 10月
  { quote: '技术是改变世界的最大杠杆。', author: 'Peter Thiel（PayPal创始人）' },
  { quote: '人工智能将使科学研究更快速。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '产品设计的本质是简化生活。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '深度学习让机器可以创作艺术。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '技术应该成为人类能力的延伸。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将使能源更清洁。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '设计是关于功能与美感的统一。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '区块链将重新定义所有权。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '数字化转型需要领导层的支持。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能将使零售更智能。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '技术进步应该让世界更公平。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将改变保险行业。', author: 'Marc Benioff（Salesforce创始人）' },
  { quote: '产品成功来自于对细节的关注。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '人工智能将使人力资源更高效。', author: 'Satya Nadella（微软CEO）' },
  { quote: '设计思维可以改变组织。', author: 'Tim Brown（IDEO CEO）' },
  { quote: '技术是实现可持续发展的关键。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能将使金融更普惠。', author: 'Jack Ma（阿里巴巴创始人）' },
  { quote: '数字化转型的关键是持续创新。', author: 'Satya Nadella（微软CEO）' },
  { quote: '技术应该保护环境。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将使旅游更便捷。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '产品设计的未来是情感设计。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '技术进步需要多元化的视角。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将使物流更高效。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '区块链将创造新的商业模式。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '技术应该让人们更自由。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能将使内容审核更智能。', author: 'Zhang Yiming（字节跳动创始人）' },
  { quote: '产品成功的关键是用户体验。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '数字化转型是一场马拉松，不是短跑。', author: 'Satya Nadella（微软CEO）' },
  { quote: '技术进步需要负责任地创新。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将使房地产更智能。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '设计是创造美好未来的途径。', author: 'Tim Brown（IDEO CEO）' },
  // 11月
  { quote: '技术是推动文明进步的力量。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '人工智能将使气候变化研究更深入。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '产品设计的核心是价值观。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '深度学习已经改变了翻译。', author: 'Geoffrey Hinton（AI教父）' },
  { quote: '技术应该促进创新而不是限制创新。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将使城市规划更科学。', author: 'Sundar Pichai（谷歌CEO）' },
  { quote: '设计是关于创造价值并分享价值。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '区块链将创造更透明的世界。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '数字化转型需要全员的参与。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能将使人力资源管理更智能。', author: 'Marc Benioff（Salesforce创始人）' },
  { quote: '技术进步应该与人类价值观一致。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将改变媒体行业。', author: 'Zhang Yiming（字节跳动创始人）' },
  { quote: '产品成功的关键是满足用户需求。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '人工智能将使法律服务更普惠。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '设计思维是解决问题的能力。', author: 'Tim Brown（IDEO CEO）' },
  { quote: '技术是连接过去与未来的桥梁。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能将使库存管理更智能。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '数字化转型的关键是客户体验。', author: 'Satya Nadella（微软CEO）' },
  { quote: '技术应该促进可持续发展。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将使食品安全更有保障。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '产品设计的最高境界是无缝体验。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '技术进步需要开放合作。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将使供应链更韧。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '区块链将重新定义合同。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '技术应该增强人类智慧。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能将使心理健康服务更普及。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '产品成功来自于对完美的追求。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '数字化转型是一场认知革命。', author: 'Satya Nadella（微软CEO）' },
  { quote: '技术进步应该让生活更有尊严。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将使健身更个性化。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '设计是让复杂变简单。', author: 'Jony Ive（苹果前首席设计师）' },
  // 12月
  { quote: '技术是实现愿景的工具。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能将使个性化教育成为常态。', author: 'Sal Khan（可汗学院创始人）' },
  { quote: '产品设计的本质是爱。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '深度学习已经改变了游戏。', author: 'Demis Hassabis（DeepMind创始人）' },
  { quote: '技术应该促进而不是加剧不平等。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将使医疗更预防性。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '设计是关于人的需求。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '区块链将创造新的信任基础设施。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '数字化转型需要战略耐心。', author: 'Satya Nadella（微软CEO）' },
  { quote: '人工智能将使工作协作更高效。', author: 'Marc Benioff（Salesforce创始人）' },
  { quote: '技术进步应该让人类更幸福。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将改变我们的学习方式。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '产品成功的关键是激情。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '人工智能将使生活更便捷。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '设计思维让不可能变为可能。', author: 'Tim Brown（IDEO CEO）' },
  { quote: '技术是探索宇宙的钥匙。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能将使服务更有温度。', author: 'Satya Nadella（微软CEO）' },
  { quote: '数字化转型需要以价值观为导向。', author: 'Satya Nadella（微软CEO）' },
  { quote: '技术应该让世界更紧密。', author: 'Mark Zuckerberg（Meta创始人）' },
  { quote: '人工智能将使创新更普及。', author: 'Zhang Yiming（字节跳动创始人）' },
  { quote: '产品设计的未来是环境智能。', author: 'Jony Ive（苹果前首席设计师）' },
  { quote: '技术进步需要长远的眼光。', author: 'Larry Page（谷歌联合创始人）' },
  { quote: '人工智能将使创意更无限。', author: 'Sam Altman（OpenAI CEO）' },
  { quote: '区块链将创造新的协作方式。', author: 'Vitalik Buterin（以太坊创始人）' },
  { quote: '技术应该让传统更有生命力。', author: 'Tim Cook（苹果CEO）' },
  { quote: '人工智能将使礼物更贴心。', author: 'Jeff Bezos（亚马逊创始人）' },
  { quote: '产品成功的关键是梦想。', author: 'Steve Jobs（苹果创始人）' },
  { quote: '数字化转型是通往未来的路。', author: 'Satya Nadella（微软CEO）' },
  { quote: '技术进步应该让每个日子更有意义。', author: 'Elon Musk（特斯拉/SpaceX创始人）' },
  { quote: '人工智能将使祝福更温暖。', author: 'Zhang Yiming（字节跳动创始人）' },
  { quote: '设计是让每一天更美好的魔法。', author: 'Jony Ive（苹果前首席设计师）' }
]

// 每天显示不同的名言（按一年365天循环）
const getDailyQuote = () => {
  const now = new Date()
  // 使用一年中的第几天（0-364）
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = dayOfYear % dailyQuotes.length
  return dailyQuotes[index]
}

const IndexPage: FC = () => {
  const [newsData, setNewsData] = useState<NewsResponse>({ hot: [], policy: [], market: [] })
  const [loading, setLoading] = useState(true)
  const [dailyQuote] = useState(getDailyQuote)
  
  // 记录上次刷新日期
  const lastRefreshDateRef = { current: '' }
  let hasCheckedToday = false

  useLoad(() => {
    console.log('Index page loaded.')
  })

  const getTodayDateStr = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

  // 只在每天首次加载时获取数据
  useDidShow(() => {
    const today = getTodayDateStr()
    
    // 如果今天还没刷新过，则获取数据
    if (lastRefreshDateRef.current !== today && !hasCheckedToday) {
      console.log('[useDidShow] First visit today, fetching news...')
      fetchNews()
      lastRefreshDateRef.current = today
      hasCheckedToday = true
    } else {
      console.log('[useDidShow] Already checked today, skip refresh')
      setLoading(false)
    }
  })

  useShareAppMessage(() => ({
    title: '智界雷达 - 具身智能与空间智能专业资讯',
    path: '/pages/index/index',
    imageUrl: '/assets/share-cover.png'
  }))

  useShareTimeline(() => ({
    title: '智界雷达 - 具身智能与空间智能专业资讯',
    query: '',
    imageUrl: '/assets/share-cover.png'
  }))

  const fetchNews = async () => {
    try {
      setLoading(true)
      console.log('[Fetch News] Fetching latest news...')
      
      const response = await Network.request({
        url: '/api/news/list',
        method: 'GET',
      })
      
      console.log('[Fetch News] Response:', response)
      
      // 确保数据格式正确
      const data = response.data as NewsResponse
      if (data && (data.hot?.length > 0 || data.policy?.length > 0 || data.market?.length > 0)) {
        setNewsData({
          hot: data.hot || [],
          policy: data.policy || [],
          market: data.market || []
        })
        lastRefreshDateRef.current = getTodayDateStr()
      } else {
        console.warn('[Fetch News] No data in response:', response)
      }
    } catch (error) {
      console.error('[Fetch News] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewsClick = (news: NewsItem) => {
    Taro.setStorageSync('currentNews', news)
    Taro.navigateTo({
      url: `/pages/detail/index?id=${news.id}`
    })
  }

  const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    return `${year}年${month}月${date}日`
  }

  // 渲染资讯卡片 - 内容与启示分行显示，带小标题
  const renderNewsCard = (news: NewsItem, section: 'hot' | 'policy' | 'market') => {
    const sectionStyles = {
      hot: { 
        border: 'border-emerald-500', 
        bg: 'bg-emerald-500 bg-opacity-[0.02]',
        icon: '💡',
        title: '行业启示'
      },
      policy: { 
        border: 'border-blue-500', 
        bg: 'bg-blue-500 bg-opacity-[0.02]',
        icon: '📊',
        title: '战略影响'
      },
      market: { 
        border: 'border-purple-500', 
        bg: 'bg-purple-500 bg-opacity-[0.02]',
        icon: '📈',
        title: '行业启示'
      }
    }
    const style = sectionStyles[section]
    
    return (
      <View 
        key={news.id} 
        className="mb-4 bg-neutral-900 rounded-xl overflow-hidden"
        onClick={() => handleNewsClick(news)}
      >
        {/* 标题区域 */}
        <View className="px-4 pt-4 pb-3">
          <Text className="text-white font-bold text-base leading-relaxed block">
            【{news.title}】
          </Text>
          <Text className="text-neutral-500 text-xs block mt-1">
            {news.publishTime} · {news.source}
          </Text>
        </View>
        
        {/* 内容模块 */}
        {news.coreContent && (
          <View className="px-4 pb-4 pt-1">
            <View className="flex items-center gap-2 mb-2">
              <View className="w-1 h-4 bg-neutral-500 rounded-full" />
              <Text className="text-neutral-400 text-sm font-medium">内容</Text>
            </View>
            <Text className="block text-neutral-200 text-sm leading-relaxed">
              {news.coreContent}
            </Text>
          </View>
        )}
        
        {/* 行业启示模块 - 卡片式设计 */}
        {news.bawitonAnalysis && (
          <View className="px-4 pb-4">
            <View className={`${style.bg} rounded-lg p-3 border-l-2 ${style.border}`}>
              <View className="flex items-center gap-2 mb-2">
                <Text className="text-base">{style.icon}</Text>
                <Text className="text-white text-sm font-semibold">{style.title}</Text>
              </View>
              <Text className="block text-neutral-200 text-sm leading-relaxed">
                {news.bawitonAnalysis}
              </Text>
            </View>
          </View>
        )}
        
        {/* 建议行动模块 - 卡片式设计 */}
        {news.recommendation && (
          <View className="px-4 pb-4">
            <View className="bg-amber-500 bg-opacity-[0.02] rounded-lg p-3 border-l-2 border-amber-500">
              <View className="flex items-center gap-2 mb-2">
                <Text className="text-base">🎯</Text>
                <Text className="text-amber-400 text-sm font-semibold">建议行动</Text>
              </View>
              <Text className="block text-neutral-200 text-sm leading-relaxed">
                {news.recommendation}
              </Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  // 渲染分组标题
  const renderSectionHeader = (title: string, subtitle: string, icon: React.ReactNode) => (
    <View className="flex items-center gap-3 mb-5 px-4">
      <View className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
        {icon}
      </View>
      <View className="flex flex-col gap-1">
        <Text className="text-white font-bold text-base">{title}</Text>
        <Text className="text-neutral-500 text-xs">{subtitle}</Text>
      </View>
    </View>
  )

  // 加载骨架屏
  const renderSkeleton = () => (
    <View className="px-4">
      {[1, 2, 3].map((section) => (
        <View key={section} className="mb-5">
          <View className="h-6 w-32 bg-neutral-800 rounded mb-3" />
          {[1, 2].map((i) => (
            <View key={i} className="mb-3 bg-neutral-900 rounded-xl p-4">
              <View className="h-4 bg-neutral-800 rounded w-full mb-2" />
              <View className="h-3 bg-neutral-800 rounded w-24 mb-3" />
              <View className="h-3 bg-neutral-800 rounded w-full mb-2" />
              <View className="h-3 bg-neutral-800 rounded w-3/4" />
            </View>
          ))}
        </View>
      ))}
    </View>
  )

  return (
    <View className="min-h-screen bg-black pb-8">
      {/* Header */}
      <View 
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
        className="px-4 pt-10 pb-4"
      >
        <View className="flex flex-col gap-2">
          <Text className="text-white text-xl font-bold">智界雷达</Text>
          <Text className="text-neutral-500 text-sm">{getTodayDate()}</Text>
        </View>
        
        {/* 系统说明 */}
        <View className="bg-neutral-900 bg-opacity-50 rounded-lg p-3 mb-2 mt-4">
          <Text className="text-neutral-400 text-xs leading-relaxed">
            每日自动抓取具身智能与空间智能领域最新资讯，AI智能分析热点、政策、市场动态，提供战略思考与决策参考。
          </Text>
        </View>
        
        {/* 每日一句 */}
        <View className="border-l-2 border-neutral-700 pl-3">
          <Text className="text-neutral-500 text-xs italic leading-relaxed">
            &ldquo;{dailyQuote.quote}&rdquo;
          </Text>
          <Text className="text-neutral-600 text-xs mt-1 block">
            —— {dailyQuote.author}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        renderSkeleton()
      ) : (
        <View className="pt-4">
          {/* 每日热点资讯 */}
          {newsData.hot.length > 0 && (
            <View className="mb-5">
              {renderSectionHeader('每日热点', '技术突破与行业启示', <TrendingUp size={18} color="#10b981" />)}
              <View className="px-4">
                {newsData.hot.map((item) => renderNewsCard(item, 'hot'))}
              </View>
            </View>
          )}

          {/* 宏观风向 */}
          {newsData.policy.length > 0 && (
            <View className="mb-5">
              {renderSectionHeader('宏观风向', '政策解读与战略影响', <Globe size={18} color="#3b82f6" />)}
              <View className="px-4">
                {newsData.policy.map((item) => renderNewsCard(item, 'policy'))}
              </View>
            </View>
          )}

          {/* 市场微观 */}
          {newsData.market.length > 0 && (
            <View className="mb-5">
              {renderSectionHeader('市场微观', '市场动态与行动建议', <Briefcase size={18} color="#a855f7" />)}
              <View className="px-4">
                {newsData.market.map((item) => renderNewsCard(item, 'market'))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default IndexPage
