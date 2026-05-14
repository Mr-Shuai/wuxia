import type { StoryNode } from '../types'

export const storyNodes: Record<string, StoryNode> = {
  N00: {
    id: 'N00',
    title: '破庙夜雨',
    location: '郊野破庙',
    content: [
      '夜雨敲破了瓦缝，一名身负刀伤的密探倒在残灯下，袖中还攥着一角血湿的纸页。',
      '他气若游丝，只来得及低声求一句：莫让东西落进黑市之手。',
    ],
    choices: [
      {
        id: 'rescue-spy',
        text: '收留并救治密探',
        nextNodeId: 'N10',
        effects: {
          log: '你冒雨生火，为密探止了血，也欠下了一段人情。',
          stats: { debt: 1, morality: 1, reputation: 1 },
          flags: { savedSpy: true },
        },
      },
      {
        id: 'leave-spy',
        text: '谨慎离去，不惹祸上身',
        nextNodeId: 'N10',
        effects: {
          log: '你转身离去，雨声掩住了那人的呼吸，也让麻烦在暗处生根。',
          stats: { wantedLevel: 1 },
          flags: { savedSpy: false },
        },
      },
    ],
  },
  N10: {
    id: 'N10',
    title: '镖银失踪案',
    location: '古道驿站',
    content: [
      '第二日清晨，镖局的人在驿站找上了你。昨夜失踪的并非银两，而是一份残篇抄本。',
      '你意识到，自己手里的线索正是各方争夺的真正目标。',
    ],
    choices: [
      {
        id: 'return-scroll',
        text: '把残篇交回镖局',
        nextNodeId: 'N11',
        effects: {
          log: '你把残篇交还，换来一份信任，也让自己站到了更亮的地方。',
          stats: { morality: 1, favorSword: 1, reputation: 1 },
          flags: { keptScroll: false, soldScroll: false },
        },
      },
      {
        id: 'keep-scroll',
        text: '将残篇暂且私藏',
        nextNodeId: 'N11',
        effects: {
          log: '你把残篇贴身藏起，消息却已悄然泄露。',
          stats: { wantedLevel: 1, favorBlackMarket: 1 },
          flags: { keptScroll: true },
        },
      },
      {
        id: 'sell-scroll',
        text: '卖给黑市换情报',
        nextNodeId: 'N11',
        effects: {
          log: '你把残篇交给黑市掮客，换来一条更深的暗线。',
          stats: { morality: -1, debt: 1, favorBlackMarket: 2 },
          flags: { soldScroll: true },
        },
      },
    ],
  },
  N11: {
    id: 'N11',
    title: '酒楼听风',
    location: '临江酒楼',
    content: [
      '酒楼二层，名门与帮会隔桌相望，一本账册和几句风声足以让人拔刀。',
      '你可以当众比武、潜身取证，或者坐下来用人情和口舌换一条出路。',
    ],
    choices: [
      {
        id: 'public-duel',
        text: '当众比武定是非',
        nextNodeId: 'N12',
        battleId: 'inn-duel',
        effects: {
          log: '你拔刀踏前，选择用最堂皇的方式让众人闭嘴。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
          flags: { wonInnDuel: false },
        },
      },
      {
        id: 'steal-ledger',
        text: '潜入后厨偷取账册',
        nextNodeId: 'N12',
        battleId: 'guard-skirmish',
        effects: {
          log: '你借着酒气与人影潜入暗处，但脚步终究惊动了护卫。',
          stats: { wantedLevel: 1, favorBlackMarket: 1 },
        },
      },
      {
        id: 'trade-info',
        text: '谈判交换情报',
        nextNodeId: 'N12',
        effects: {
          log: '你没有拔刀，而是让一句句真假参半的话替你开路。',
          stats: { debt: 1, reputation: 1 },
        },
      },
      {
        id: 'beam-shadow-route',
        text: '借燕行步翻上横梁，从高处看清谁在传递暗号',
        nextNodeId: 'N12',
        requires: {
          martialSkills: ['swallow-step'],
        },
        effects: {
          log: '你借着刚摸熟的步法翻上横梁，把楼中谁在递眼色看了个分明。',
          stats: { reputation: 1 },
          flags: { spottedSignalRelay: true },
        },
      },
    ],
  },
  N12: {
    id: 'N12',
    title: '山门试剑',
    location: '山门石阶',
    content: [
      '酒楼一事过后，各方都想知道你究竟要把自己交给谁。山门前的风，比夜雨更冷。',
      '但真正决定后路的，不是口头站队，而是谁能带着人证与账册活着走到寒江对岸。',
    ],
    choices: [
      {
        id: 'join-sword-sect',
        text: '入清正剑宗，换一条正路',
        nextNodeId: 'N20',
        effects: {
          log: '你在石阶前收刀行礼，借剑宗名义护送证据下山，准备明着闯过这道江湖关。',
          stats: { morality: 1, favorSword: 2, reputation: 1 },
        },
      },
      {
        id: 'join-black-market',
        text: '借黑市庇护，先活下来再说',
        nextNodeId: 'N20',
        effects: {
          log: '你没有再看山门，而是顺着暗巷走向黑市安排的船路，准备在寒江上做最后一笔交易。',
          stats: { wantedLevel: 1, favorBlackMarket: 2, debt: 1 },
        },
      },
      {
        id: 'protect-secret-line',
        text: '替密探守住暗线，不入任何门下',
        nextNodeId: 'N20',
        effects: {
          log: '你把名字留在风里，却把证据和人情都押给了那条看不见的暗线，准备亲自把人送过江。',
          stats: { reputation: 1, debt: 1 },
          flags: { savedSpy: true },
        },
      },
      {
        id: 'stay-wanderer',
        text: '仍做江湖浪客，把路留给自己',
        nextNodeId: 'N20',
        effects: {
          log: '你谢绝了所有招揽，决定以自己的名字护着这趟路，看看江湖究竟值不值得你站队。',
          stats: { reputation: 1 },
        },
      },
    ],
  },
  N20: {
    id: 'N20',
    title: '寒江渡口',
    location: '寒江渡口',
    content: [
      '寒江边的渡船一明一暗：官渡灯火通明，却早有人埋眼线；黑船藏在芦苇深处，只认银票和旧债。',
      '你身边的人证神色紧绷，怀里的账册却比刀还沉。再往前一步，就会逼出真正的追兵。',
    ],
    choices: [
      {
        id: 'escort-witness',
        text: '护住人证与账册，走明路过江',
        nextNodeId: 'N21',
        effects: {
          log: '你亮明行踪，护着人证踏上官渡，把所有视线都拉到了自己身上。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
        },
      },
      {
        id: 'take-black-ferry',
        text: '买通黑船船头，借夜色潜江',
        nextNodeId: 'N21',
        effects: {
          log: '你把碎银塞进船头手里，任由黑船载着你和秘密一起没入夜色。',
          stats: { wantedLevel: 1, debt: 1, favorBlackMarket: 1 },
        },
      },
      {
        id: 'travel-alone',
        text: '让人证先走，自己独自引开追兵',
        nextNodeId: 'N21',
        effects: {
          log: '你把真正重要的人和物拆开，自己提刀走上更显眼的河堤。',
          stats: { reputation: 1, debt: 1 },
        },
      },
      {
        id: 'threaten-boatman-with-dagger',
        text: '亮出乌鞘短刀逼船头让路，先抢下船位与时机',
        nextNodeId: 'N21',
        requires: {
          inventory: ['black-sheath-dagger'],
        },
        effects: {
          log: '你把乌鞘短刀压在船头木栏上，对方立刻明白今晚该让谁先上船。',
          stats: { reputation: 1, wantedLevel: 1 },
        },
      },
    ],
  },
  N21: {
    id: 'N21',
    title: '藏经阁火光',
    location: '渡江藏经阁',
    content: [
      '渡江之后，藏经阁外火光骤起。幕后之人终于不再借刀杀人，而是亲自来收尾。',
      '账册、人证、旧恩和新债都聚在一处。你必须决定，真相究竟该照亮谁，又该烧毁谁。',
    ],
    choices: [
      {
        id: 'expose-ledger',
        text: '公开账册，逼幕后之人现身',
        nextNodeId: 'N30',
        effects: {
          log: '你将账册抛到火光前，让所有藏在暗处的手都无处可退，火光也把追兵全引向了渡口。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
        },
      },
      {
        id: 'sell-final-secret',
        text: '把最后的真相卖个好价钱',
        nextNodeId: 'N30',
        effects: {
          log: '你没有替任何人守住清白，只替自己换来一条更稳妥的退路，也让黑市的船先一步贴近了岸。',
          stats: { wantedLevel: 1, debt: 1, favorBlackMarket: 2 },
        },
      },
      {
        id: 'send-evidence-away',
        text: '送走人证与证据，自己藏回暗处',
        nextNodeId: 'N30',
        requires: {
          flags: { savedSpy: true },
          minStats: { debt: 2 },
        },
        effects: {
          log: '你亲手把证据送出火场，自己却转身没入无人能辨认的阴影，准备在渡口给追兵留下最后一道假影。',
          stats: { debt: 1, reputation: 1 },
        },
      },
      {
        id: 'burn-the-ledger',
        text: '烧掉账册，让江湖自己去猜',
        nextNodeId: 'N30',
        effects: {
          log: '你把答案交给火，把选择留给以后还要活下去的人，而你必须先在渡口活过今晚。',
          stats: { reputation: 1 },
        },
      },
    ],
  },
  N30: {
    id: 'N30',
    title: '渡口夜战',
    location: '寒江白堤外泊口',
    content: [
      '藏经阁的火还映在江面上，真正的截杀却已追到了渡口。快船、钩索与埋伏的弩手，把整条退路压成一线。',
      '你必须在夜色里决定：是硬断对手的追势，还是趁乱把人和证据分开送走。',
    ],
    choices: [
      {
        id: 'cut-anchor-chain',
        text: '斩断锚链，先保住人证与退路',
        nextNodeId: 'N31',
        effects: {
          log: '你纵身斩断锚链，让泊船顺流脱出，也把追兵的包围撕开了一角。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
        },
      },
      {
        id: 'reed-waterway',
        text: '借芦苇水道转移证据',
        nextNodeId: 'N31',
        effects: {
          log: '你借着芦苇与暗潮遮蔽视线，把真正重要的东西先送离了主航道。',
          stats: { debt: 1, reputation: 1 },
        },
      },
      {
        id: 'hold-the-pier',
        text: '回身守住栈桥，正面击退夜袭',
        nextNodeId: 'N31',
        battleId: 'night-raid-captain',
        effects: {
          log: '你反身立在栈桥中央，逼自己成为这场夜袭唯一不能退的那个人。',
          stats: { morality: 1, wantedLevel: 1, reputation: 1 },
        },
      },
    ],
  },
  N31: {
    id: 'N31',
    title: '白堤裁断',
    location: '寒江白堤',
    content: [
      '天色将明，幸存的人、剩下的证据与昨夜的选择终于都被带到了白堤上。江湖与官面都在等你给出最后一句话。',
      '你已经不能只决定自己站在哪边，你还要决定谁能带着这份真相活下去。',
    ],
    choices: [
      {
        id: 'hand-to-righteous',
        text: '当众交证，让清流接手此案',
        nextNodeId: 'N40',
        requires: {
          flags: { lostNightRaid: false },
        },
        effects: {
          log: '你把证据交到众目睽睽之下，让这场风波第一次有了不能被轻易抹去的名字。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
          flags: { choseRighteousVerdict: true },
        },
      },
      {
        id: 'call-out-mastermind',
        text: '挟昨夜胜势，当众逼主谋伏法',
        nextNodeId: 'N40',
        requires: {
          flags: { wonNightRaid: true },
        },
        effects: {
          log: '你借昨夜一战立下的威势当众发难，让主谋连最后一层体面都无处可藏。',
          stats: { morality: 1, reputation: 2, favorSword: 1 },
          flags: { choseRighteousVerdict: true },
        },
      },
      {
        id: 'sell-to-black-market',
        text: '只交给出价最高的人',
        nextNodeId: 'N40',
        effects: {
          log: '你选了最现实的一条路，把一切都换成自己还能掌握的筹码。',
          stats: { wantedLevel: 1, debt: 1, favorBlackMarket: 2 },
          flags: { choseBlackMarketVerdict: true },
        },
      },
      {
        id: 'sell-out-under-pressure',
        text: '趁败局把证据和人一起卖给黑市',
        nextNodeId: 'N40',
        requires: {
          flags: { lostNightRaid: true },
        },
        effects: {
          log: '你借夜战溃散后的乱局与黑市重新谈价，把残局也变成了自己活命的筹码。',
          stats: { wantedLevel: 2, debt: 1, favorBlackMarket: 3 },
          flags: { choseBlackMarketVerdict: true },
        },
      },
      {
        id: 'mask-the-exit',
        text: '借胜势伪造追缉，掩护暗线彻底脱身',
        nextNodeId: 'N40',
        requires: {
          flags: { savedSpy: true, wonNightRaid: true },
          minStats: { debt: 2 },
        },
        effects: {
          log: '你借昨夜一战的威势反手布下假追缉，把所有视线都引向自己身后，让暗线真正消失在白堤尽头。',
          stats: { debt: 1, reputation: 1 },
          flags: { choseSecretVerdict: true },
        },
      },
      {
        id: 'fade-into-secret-line',
        text: '送暗线远走，自己从此不留名',
        nextNodeId: 'N40',
        requires: {
          flags: { savedSpy: true },
          minStats: { debt: 2 },
        },
        effects: {
          log: '你看着暗线与证据一起消失在晨雾里，只把自己的名字留给再无人能查清的旧案。',
          stats: { debt: 1, reputation: 1 },
          flags: { choseSecretVerdict: true },
        },
      },
      {
        id: 'walk-away-after-victory',
        text: '趁众人还在争功，自己乘舟离岸',
        nextNodeId: 'N40',
        requires: {
          flags: { wonNightRaid: true },
        },
        effects: {
          log: '你把争功与定案都留在了白堤上，自己只趁着众声喧哗时踏上离岸的小舟。',
          stats: { reputation: 2 },
          flags: { choseNeutralVerdict: true },
        },
      },
      {
        id: 'leave-without-verdict',
        text: '把真相留在传闻里，自己转身离岸',
        nextNodeId: 'N40',
        effects: {
          log: '你没有替任何一方说完最后一句话，只让这段风波继续在江湖里发酵。',
          stats: { reputation: 1 },
          flags: { choseNeutralVerdict: true },
        },
      },
    ],
  },
  N40: {
    id: 'N40',
    title: '京华风起',
    location: '入京官道',
    content: [
      '白堤上的裁断只够让这一夜落幕，却远远不足以让整桩旧案真正停下。消息比船更快，已经沿着官道与暗驿一路吹向京华。',
      '你站在北上的分岔口前，终于明白自己昨夜选中的不是结局，而是下一章要以什么身份走进更大的风里。',
    ],
    choices: [
      {
        id: 'enter-capital-as-witness',
        text: '带着人证入京，把案子送上更高处',
        nextNodeId: 'N50',
        requires: {
          flags: { choseRighteousVerdict: true },
        },
        effects: {
          log: '你没有在白堤止步，而是护着人证继续北上，准备把这场江湖案拖进京华的灯火之下。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
        },
      },
      {
        id: 'cash-in-before-capital',
        text: '趁京中风声未定，先把名单卖出天价',
        nextNodeId: 'N51',
        requires: {
          flags: { choseBlackMarketVerdict: true },
        },
        effects: {
          log: '你顺着黑市递来的新价码北上，把白堤换来的筹码继续做成能在京华站稳的本钱。',
          stats: { wantedLevel: 1, debt: 1, favorBlackMarket: 2 },
        },
      },
      {
        id: 'escort-secret-into-capital',
        text: '借官道烟尘北上，把暗线埋进京华人海',
        nextNodeId: 'N52',
        requires: {
          flags: { choseSecretVerdict: true },
        },
        effects: {
          log: '你借着众人都以为此案已定的片刻空隙，陪暗线一路北上，让真正的证据在京华重新找到落点。',
          stats: { debt: 1, reputation: 1 },
        },
      },
      {
        id: 'leave-before-capital-storm',
        text: '趁风还没卷到京华之前，先把自己藏回江湖',
        nextNodeId: 'N53',
        requires: {
          flags: { choseNeutralVerdict: true },
        },
        effects: {
          log: '你远远看着北去的车马，把更大的风波留给京华，自己则带着尚未说完的故事折回江湖。',
          stats: { reputation: 1 },
        },
      },
    ],
  },
  N50: {
    id: 'N50',
    title: '金台晨鼓',
    location: '京华外城金台门',
    content: [
      '北地晨鼓未绝，你已带着人证到了金台门外。守门军士只认文书，围观百姓却已从流言里嗅出了血腥气。',
      '你要决定，是把案子一口气击进朝堂，还是先借宗门与清流的手稳住人证，再逼主谋在京中现形。',
    ],
    choices: [
      {
        id: 'strike-drum-at-dawn',
        text: '天明击登闻鼓，把整桩案子送进朝堂',
        nextNodeId: 'N60',
        effects: {
          log: '你在晨鼓声里亲手击响登闻鼓，让这桩本该埋在江湖里的旧案第一次被京华万人同时听见。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
        },
      },
      {
        id: 'deliver-ledger-to-censorate',
        text: '先把账册送入御史台，逼主谋自己露面',
        nextNodeId: 'N60',
        effects: {
          log: '你没有立刻喧哗，而是先把账册递进更懂得追索旧案的人手中，等着京华自己掀起风暴。',
          stats: { morality: 1, favorSword: 1, reputation: 1 },
        },
      },
    ],
  },
  N51: {
    id: 'N51',
    title: '鬼市换帖',
    location: '京华东市暗坊',
    content: [
      '京华的黑市比寒江更安静，安静得像一把藏在袖中的短刀。白堤换来的名单已经被几路买家盯上，连内廷旧人都在悄悄问价。',
      '你知道这一章不再只是卖命换钱，而是决定自己在京中究竟做掮客，还是做握着别人把柄的庄家。',
    ],
    choices: [
      {
        id: 'auction-the-ledger',
        text: '设局抬价，让几方买家在暗坊里互咬',
        nextNodeId: 'N61',
        effects: {
          log: '你借京华暗坊的规矩反过来布了个局，让原本想吞掉证据的人先彼此抬价、彼此揭底。',
          stats: { wantedLevel: 1, debt: 1, favorBlackMarket: 2 },
        },
      },
      {
        id: 'trade-names-for-passage',
        text: '只卖名字不卖原册，换自己在京中一条活路',
        nextNodeId: 'N61',
        effects: {
          log: '你把最致命的那几页分开出手，让所有人都只知道你手里还有后半局，因此谁也不敢先动你。',
          stats: { debt: 1, favorBlackMarket: 2, reputation: 1 },
        },
      },
    ],
  },
  N52: {
    id: 'N52',
    title: '雾巷接灯',
    location: '京华西坊旧雾巷',
    content: [
      '京华雾巷里没有人会直呼彼此的名字，接头的只有暗号、灯影与故意踩错半步的靴声。你终于把暗线带进了更大的棋局，却也走进了更深的险地。',
      '若想让真相继续活着，就不能只会逃。你必须替这条暗线在京中重新找一个足够隐秘、也足够高的位置。',
    ],
    choices: [
      {
        id: 'bury-proof-in-ministry-archives',
        text: '把证据藏进旧档案库，等下一次翻案时再起火',
        nextNodeId: 'N62',
        effects: {
          log: '你把真正的证据藏进无人会立刻去看的旧档之间，让它像一根埋进京华地下的火线，等着日后再被点燃。',
          stats: { debt: 1, reputation: 1 },
        },
      },
      {
        id: 'trade-face-for-cover',
        text: '自己留在京中做明饵，换暗线彻底改名换姓',
        nextNodeId: 'N62',
        effects: {
          log: '你把自己留在台前做那枚故意可见的棋子，让真正该活下来的人从京华雾巷里彻底换了姓名。',
          stats: { debt: 1, reputation: 2 },
        },
      },
    ],
  },
  N53: {
    id: 'N53',
    title: '野渡回身',
    location: '京郊野渡',
    content: [
      '京华就在前方，可你忽然明白，真正能把人卷碎的往往不是刀，而是城门内那张无形的网。白堤之后，你依然有资格掉头。',
      '只是这一次离开不是逃，而是决定把答案留在更远的地方，让这场风波先在别人脚下炸开。',
    ],
    choices: [
      {
        id: 'watch-from-far-bank',
        text: '泊舟对岸，等京华自己把水搅浑',
        nextNodeId: 'N63',
        effects: {
          log: '你在远岸收舟观火，把最后一手留在自己掌中，等京华先替你把局势搅得更乱。',
          stats: { reputation: 1 },
        },
      },
      {
        id: 'return-to-jianghu-with-rumor',
        text: '带着半真半假的传闻折回江湖，再看谁会先出招',
        nextNodeId: 'N63',
        effects: {
          log: '你没有踏进城门，而是把京华当成下一场风波的火种，自己带着新的传闻回到更熟悉的江湖里。',
          stats: { reputation: 1, debt: 1 },
        },
      },
    ],
  },
  N60: {
    id: 'N60',
    title: '乌台风压',
    location: '京华乌台外署',
    content: [
      '鼓声、账册和人证终究把案子推到了乌台门前。真正危险的已不再是江湖刀客，而是那些仍想把旧案压回卷宗底下的人。',
      '你若想让这条正道走到底，就得在宗门、清流和朝堂之间选一个最锋利的借力点，把主谋最后的回旋也一并压碎。',
    ],
    choices: [
      {
        id: 'summon-sect-allies',
        text: '联络剑宗与清流同上乌台，把主谋退路一并封死',
        nextNodeId: 'N70',
        effects: {
          log: '你把剑宗名望与清流笔锋拧成一股力，在乌台门前逼得旧案再也压不回去。',
          stats: { reputation: 2, favorSword: 1 },
        },
      },
      {
        id: 'guard-the-witness-through-night',
        text: '先护人证熬过这一夜，等第二天在朝会上当众翻案',
        nextNodeId: 'N70',
        effects: {
          log: '你没有急着求快，而是亲自守着人证熬过京华最冷的一夜，只等天亮时把旧案翻到所有人面前。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
        },
      },
    ],
  },
  N61: {
    id: 'N61',
    title: '金笼夜宴',
    location: '京华南城私宴楼',
    content: [
      '几页名单就够让京华不少人夜不能寐。你被请进一场只点半数灯火的夜宴，席间坐着的每个人都想买命，也都怕自己先成别人的筹码。',
      '你必须决定，是把他们一网打成更大的交易，还是故意留出破口，让这座城自己彼此咬噬。',
    ],
    choices: [
      {
        id: 'sell-their-fear-back-to-them',
        text: '把所有人的惧意一起做价，逼他们替你养路',
        nextNodeId: 'N71',
        effects: {
          log: '你不急着卖卷，而是先卖恐惧，让整场夜宴的人都主动替你铺好往后数步的路。',
          stats: { debt: 1, favorBlackMarket: 2, reputation: 1 },
        },
      },
      {
        id: 'leave-one-name-unpriced',
        text: '故意留下一页不卖，让京华黑白两道继续互查',
        nextNodeId: 'N71',
        effects: {
          log: '你把最重要的一页故意扣下，让买到东西的人也无法安心，只能继续在京华替你搅局。',
          stats: { wantedLevel: 1, favorBlackMarket: 2 },
        },
      },
    ],
  },
  N62: {
    id: 'N62',
    title: '灯下换名',
    location: '京华旧档密库',
    content: [
      '真正难的不是把暗线送进京华，而是让他从此在京华活成另一个人。旧档密库灯火极暗，每翻一页，都像替谁重写一遍命。',
      '你得决定，是把证据埋得更深，还是把自己推得更前，让真正要活下来的人彻底消失在人群里。',
    ],
    choices: [
      {
        id: 'rewrite-the-records',
        text: '借旧档改名换籍，把暗线从卷宗里彻底抹去',
        nextNodeId: 'N72',
        effects: {
          log: '你用一夜时间替那条暗线改写了能被查到的一切，让追查者从此只会越查越远。',
          stats: { debt: 1, reputation: 1 },
        },
      },
      {
        id: 'become-the-visible-shadow',
        text: '把自己留成唯一线头，让所有追索都先落到你身上',
        nextNodeId: 'N72',
        effects: {
          log: '你主动把自己变成最醒目的那点影子，替真正要消失的人挡下了所有先来的目光。',
          stats: { debt: 1, reputation: 2 },
        },
      },
    ],
  },
  N63: {
    id: 'N63',
    title: '城外听潮',
    location: '京郊潮平码头',
    content: [
      '你终究没有立刻回身离开，而是在城外多留了几日，看着京华因为那点真相自己起浪。城门里的每一次调动，都会顺着风传到码头。',
      '这时你已不必选边，只需决定：是继续做那个远岸观局的人，还是在江湖重新放出一把更长的风声。',
    ],
    choices: [
      {
        id: 'watch-the-city-burn-slowly',
        text: '继续停在远岸，看京华自己把局势烧穿',
        nextNodeId: 'N73',
        effects: {
          log: '你把舟泊得更远了一些，任由京华自己把火越烧越旺，而你只保留最后决定何时回身的自由。',
          stats: { reputation: 1 },
        },
      },
      {
        id: 'carry-the-rumor-south',
        text: '南下放出新传闻，把下一轮风波重新引回江湖',
        nextNodeId: 'N73',
        effects: {
          log: '你带着京华新生的流言南下，把这座城的风浪重新折回江湖，让更多人不得不提前出手。',
          stats: { reputation: 1, debt: 1 },
        },
      },
    ],
  },
  N70: {
    id: 'N70',
    title: '丹陛回雪',
    location: '京华正殿丹陛前',
    content: [
      '乌台外的角力只是前奏，真正决定旧案生死的，是丹陛之前那一段不足百步的雪石长阶。有人要你退，也有人要你快，可你知道只要走到殿前，这桩案子就再也收不回去了。',
      '你必须决定，是亲自护着奏疏与人证入殿，还是先借清流逼宫，把殿上的每一张脸都拖进这场旧案。',
    ],
    choices: [
      {
        id: 'escort-memorial-into-hall',
        text: '护着奏疏与人证入殿，当廷把旧案钉死',
        nextNodeId: 'N80',
        effects: {
          log: '你亲自护着奏疏与人证踏上丹陛，把一路以来所有刀光与流言都化成了殿前那一句再不能回避的话。',
          stats: { morality: 1, reputation: 1 },
        },
      },
      {
        id: 'force-ministers-to-answer',
        text: '借清流连署逼问，让满殿先给天下一个交代',
        nextNodeId: 'N80',
        effects: {
          log: '你把证据和连署一起抬到殿前，让原本还想装聋作哑的人不得不先在天下面前开口。',
          stats: { reputation: 2, favorSword: 1 },
        },
      },
    ],
  },
  N71: {
    id: 'N71',
    title: '玉杯反照',
    location: '京华北里玉杯楼',
    content: [
      '你把一场夜宴变成了整座城的价码，接下来真正要卖的已不是名字，而是各家互相钳制的未来。玉杯楼上的灯火越亮，说明每个人心里越慌。',
      '此刻你只需决定，是把所有人都拖进同一条船，还是故意放走一个最危险的买家，让他替你把火带去更深的地方。',
    ],
    choices: [
      {
        id: 'bind-buyers-together',
        text: '让几方买家互签暗契，从此谁都别想独善其身',
        nextNodeId: 'N81',
        effects: {
          log: '你没有再卖更多纸页，而是逼几方买家彼此捆上暗契，让他们从此只能继续替你守住这场局。',
          stats: { debt: 1, favorBlackMarket: 2 },
        },
      },
      {
        id: 'release-the-most-dangerous-buyer',
        text: '故意放走最危险的那个人，让他把京华搅得更浑',
        nextNodeId: 'N81',
        effects: {
          log: '你故意留出一条缝，让最危险的买家带着半截真相逃走，也让整座京华开始替你追逐他的影子。',
          stats: { wantedLevel: 1, reputation: 1, favorBlackMarket: 1 },
        },
      },
    ],
  },
  N72: {
    id: 'N72',
    title: '无名灯录',
    location: '京华秘阁夹层',
    content: [
      '旧档已改，追索也被引开，可真正让一条暗线活下来的从来不是一纸卷宗，而是接下来还能不能继续藏在京华人海里。你站在秘阁夹层，手里握着最后一盏不能熄的灯。',
      '你要决定，是把这盏灯交给另一个无名者，还是自己继续做那张无人知道真姓的面孔。',
    ],
    choices: [
      {
        id: 'pass-the-lamp-onward',
        text: '把最后的灯录转交下一个无名者，让暗线自己延续',
        nextNodeId: 'N82',
        effects: {
          log: '你没有把所有秘密都留在自己手里，而是把那盏灯悄悄交给下一位无名者，让暗线从此真正活成网络。',
          stats: { debt: 1, reputation: 1 },
        },
      },
      {
        id: 'remain-the-hidden-name',
        text: '继续留在京华做那张假名面孔，把所有尾巴都收在自己身后',
        nextNodeId: 'N82',
        effects: {
          log: '你决定继续留在京华，把所有尚未收净的线头都缠到自己身后，让别人能真正干净地活下去。',
          stats: { debt: 1, reputation: 2 },
        },
      },
    ],
  },
  N73: {
    id: 'N73',
    title: '潮平天阔',
    location: '南下官河渡头',
    content: [
      '你没有被京华留下，却也没有真正离开这场风波。官河的水把消息一层层送向南方，各门各派都将在更晚些时候听见这座城的回响。',
      '你可以继续做那个隔岸听潮的人，也可以先一步把风声送回江湖，看谁会因为恐惧而提早露刀。',
    ],
    choices: [
      {
        id: 'keep-drifting-beyond-the-storm',
        text: '继续顺流而下，把所有答案都留给后来者慢慢猜',
        nextNodeId: 'N83',
        effects: {
          log: '你没有替任何人写完最后一句话，只让小舟顺流而下，把真正的答案留给更长的江湖岁月去慢慢发酵。',
          stats: { reputation: 1 },
        },
      },
      {
        id: 'scatter-rumors-across-the-rivers',
        text: '沿河放出新风声，让各路人先在江湖里彼此试刀',
        nextNodeId: 'N83',
        effects: {
          log: '你把京华带来的风声沿河散出去，让各路人马先在江湖里彼此试刀，而你仍站在更远的地方看局。',
          stats: { reputation: 1, debt: 1 },
        },
      },
    ],
  },
  N80: {
    id: 'N80',
    title: '九阙定声',
    location: '京华大朝会殿前',
    content: [
      '一路把案子送到这里的人，只差最后一句话。殿前群臣各怀心思，真正悬着的却不是案卷，而是谁敢在这满朝之前先把名字点出来。',
      '你已经把江湖、清流与旧案都推到了九阙之前，现在要决定的是：以雷霆之势定案，还是留下最后一线余地，让更大的人自己跌出来。',
    ],
    choices: [
      {
        id: 'name-the-mastermind-before-all',
        text: '当着满殿点出主谋与同党，把这场旧案彻底定名',
        nextNodeId: 'E01',
        effects: {
          log: '你没有再留半分回旋，当着满殿把主谋与同党一一指名，让这场拖了太久的旧案终于有了再不能更改的名字。',
          stats: { morality: 1, reputation: 2 },
        },
      },
      {
        id: 'force-the-hidden-hand-out',
        text: '先逼幕后更高处的人出手，再顺势把案子压成铁证',
        nextNodeId: 'E01',
        effects: {
          log: '你故意留下最后半步空白，逼更高处那只手自己伸出来，再把它连同旧案一起钉死在众目之下。',
          stats: { reputation: 2, favorSword: 1 },
        },
      },
    ],
  },
  N81: {
    id: 'N81',
    title: '一局千金',
    location: '京华外城钱平码头',
    content: [
      '买家已经彼此咬出了血，可真正值钱的从来不是账册本身，而是你让整座城都开始互不信任之后留下的那条空档。最后一手，要么换成天价，要么换成今后谁都不敢轻动你的默契。',
      '你得决定，是在这里把局做绝，还是故意给未来留一个永远无法清算的尾巴。',
    ],
    choices: [
      {
        id: 'cash-out-with-everyone-indebted',
        text: '收下最后一笔封口钱，让所有人从此都欠你一步',
        nextNodeId: 'E02',
        effects: {
          log: '你把最后一笔钱收得很稳，也让参与这场局的每个人从此都在暗处欠了你一步不敢明说的人情。',
          stats: { debt: 1, favorBlackMarket: 2, reputation: 1 },
        },
      },
      {
        id: 'leave-the-ledger-half-alive',
        text: '故意留半页活口，让京华今后还得继续怕你',
        nextNodeId: 'E02',
        effects: {
          log: '你没有把所有东西都卖尽，而是故意留下半页活口，让整座京华以后都得继续提防你手里还有下一刀。',
          stats: { wantedLevel: 1, favorBlackMarket: 1, reputation: 1 },
        },
      },
    ],
  },
  N82: {
    id: 'N82',
    title: '灯尽无名',
    location: '京华旧城夹道',
    content: [
      '最后一盏灯该熄的时候，往往也是一条暗线真正活下来的时候。你已把可追的卷宗、可查的人名和可抓的影子都拆得七零八落，只剩最后一步要决定由谁来背着这些空白继续活。',
      '这是最安静的一夜，却也最像终局。你要决定，是把自己彻底抹进黑暗，还是让暗线成为今后仍能悄悄点亮别人的那一点火。',
    ],
    choices: [
      {
        id: 'erase-your-own-trace',
        text: '亲手抹去自己最后一层痕迹，让整条暗线再无人可追',
        nextNodeId: 'E04',
        effects: {
          log: '你把自己最后能被认出的那一点痕迹也亲手擦掉，从此这条暗线只剩作用，再无姓名。',
          stats: { debt: 1, reputation: 1 },
        },
      },
      {
        id: 'leave-a-secret-lantern-burning',
        text: '留下一盏只给后来人的灯，让暗线永远比追兵快一步',
        nextNodeId: 'E04',
        effects: {
          log: '你没有让最后一盏灯彻底熄灭，而是把它藏给后来人，让这条暗线以后仍能快追兵一步。',
          stats: { debt: 1, reputation: 2 },
        },
      },
    ],
  },
  N83: {
    id: 'N83',
    title: '江湖仍远',
    location: '大河南下水路',
    content: [
      '京华的风浪终于被你甩在身后，可真正广阔的地方反而在身前。你一路不曾定名，也不曾彻底抽身，于是最后留下来的，恰恰是最难被谁收编的自由。',
      '此刻你既可以继续不答，也可以把那点风声再往江湖深处送远些，让所有人都知道：这局远没有完。',
    ],
    choices: [
      {
        id: 'drift-beyond-every-banner',
        text: '不为任何一方留下答复，只把船再放远一些',
        nextNodeId: 'E03',
        effects: {
          log: '你没有回头，也没有留下新的答案，只把船放得更远，让这场风波最终只在传闻里继续追赶你的影子。',
          stats: { reputation: 1 },
        },
      },
      {
        id: 'let-the-rivers-carry-your-name',
        text: '让江河替你把传闻带开，从此只在别人故事里现身',
        nextNodeId: 'E03',
        effects: {
          log: '你把名字交给江河去传，从此不必亲自在场，也能让新的故事替你在江湖里一次次被提起。',
          stats: { reputation: 2 },
        },
      },
    ],
  },
  N90: {
    id: 'N90',
    title: '天光出城',
    location: '京华南门外长亭',
    content: [
      '大朝会的回声还在城里层层回荡，你却已经走到了南门外。尘埃虽定，真正要带走的并不是胜负，而是这一路留下的人心、名声与代价。',
      '此时再回头已无必要，你要决定的是把这份余响留给京华，还是亲自带着它走进更广阔的江湖。',
    ],
    choices: [
      {
        id: 'leave-capital-under-clear-skies',
        text: '趁天光未散离京南下，把余生留给更广阔的江湖',
        nextNodeId: 'F01',
        effects: {
          log: '你没有留在最亮的地方领受所有赞誉，而是在天光未散时离开京华，把名声与心气一起带向更广阔的人间。',
          stats: { morality: 1, reputation: 1 },
        },
      },
      {
        id: 'stay-to-watch-new-order',
        text: '暂留京华看新秩序落下，再决定下一程往哪边去',
        nextNodeId: 'F01',
        effects: {
          log: '你没有急着离开，而是站在新秩序将落未落的时候多看了一眼，确认这场风波终于留下了真正的回响。',
          stats: { reputation: 2 },
        },
      },
    ],
  },
  N91: {
    id: 'N91',
    title: '散席之后',
    location: '京华暗河平码头',
    content: [
      '灯火散了，酒也凉了，可你布下的局并没有真正结束。最值钱的从来不是这一夜赚了多少，而是谁以后还得继续忌惮你手里的余势。',
      '最后一步，是把筹码全收进口袋，还是故意留一条能让所有人睡不安稳的影子。',
    ],
    choices: [
      {
        id: 'take-the-silent-dividend',
        text: '收尽暗账与回礼，从此让整座京华都记得欠你一笔',
        nextNodeId: 'F02',
        effects: {
          log: '你把该收的都收得干净利落，也让每个活下来的人都明白：今后他们还欠着你一笔不能摆上台面的账。',
          stats: { debt: 1, favorBlackMarket: 2 },
        },
      },
      {
        id: 'leave-one-final-threat',
        text: '只带走一半利益，留下一半威胁让所有人继续不安',
        nextNodeId: 'F02',
        effects: {
          log: '你故意不把所有东西拿完，只把足够让人惧你的那一半收走，好让剩下的人以后还得继续揣测你还有多少底牌。',
          stats: { wantedLevel: 1, reputation: 1, favorBlackMarket: 1 },
        },
      },
    ],
  },
  N92: {
    id: 'N92',
    title: '灯后无人',
    location: '京华背街旧宅',
    content: [
      '最后一盏灯将熄，所有名字都该退回阴影里。你已经替别人争来活路，现在轮到你决定，自己究竟是彻底消失，还是继续做那道永远只亮给后来人的微光。',
      '这是无人知晓的一刻，却正因无人知晓，才配称作真正的终局。',
    ],
    choices: [
      {
        id: 'vanish-before-dawn',
        text: '在天亮前彻底抹去踪迹，让追索永远慢你一步',
        nextNodeId: 'F04',
        effects: {
          log: '你在天亮前抹去最后的踪迹，把所有可能追到你的人都永远甩在了一步之外。',
          stats: { debt: 1, reputation: 1 },
        },
      },
      {
        id: 'leave-the-last-codeword',
        text: '留下一句只给后来人的暗号，再把自己隐进京华人海',
        nextNodeId: 'F04',
        effects: {
          log: '你留下最后一句暗号，确保后来人仍能找到火种，而你自己则从此隐进再难辨认的人海。',
          stats: { debt: 1, reputation: 2 },
        },
      },
    ],
  },
  N93: {
    id: 'N93',
    title: '去留无题',
    location: '江南水路长风渡',
    content: [
      '你既未真正留下，也未彻底离场。风声先你一步走远，名字却还在别人嘴里起落。到了这里，答不答其实都已经成了答案。',
      '你可以继续让自己像风一样无处可寻，也可以把那点若有若无的传闻，变成往后江湖的一道长影。',
    ],
    choices: [
      {
        id: 'keep-your-distance-forever',
        text: '从此不再解释，让江湖永远只隔着传闻看你',
        nextNodeId: 'F03',
        effects: {
          log: '你不再回头，也不再解释，让自己的影子从此只存在于越来越远的传闻之中。',
          stats: { reputation: 1 },
        },
      },
      {
        id: 'become-a-riverborne-rumor',
        text: '把最后一点真相交给江河，让后人只从故事里认得你',
        nextNodeId: 'F03',
        effects: {
          log: '你把最后一点真相交给江河去带，从此后人若还记得你，也只能从故事里慢慢拼出轮廓。',
          stats: { reputation: 2 },
        },
      },
    ],
  },
  N100: {
    id: 'N100',
    title: '江南急檄',
    location: '江南漕运总道',
    content: [
      '你刚离京不久，南来快骑便把一封火漆未冷的急檄送到马前。京华旧案虽然定了声，江南盐引与漕运旧册却突然少了一卷，押送的巡按也在半路接连遇袭。',
      '你这才明白，京华那一殿并不是终局，它只是逼得更深一层的人提前动手。若让南路这册旧账再沉下去，北边好不容易掀开的天光也会被海雾重新吞回。',
    ],
    choices: [
      {
        id: 'escort-censor-south',
        text: '护送巡按与口供南下，趁官路未断先夺回盐引旧册',
        nextNodeId: 'N110',
        effects: {
          log: '你没有让京华那口气散掉，而是转身护着巡按与口供南下，准备把南路旧册也从人心与刀口之间抢回来。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
        },
      },
      {
        id: 'cut-off-the-southern-retreat',
        text: '弃官道走海门旧堤，先去截断主谋余党南逃的退路',
        nextNodeId: 'N110',
        effects: {
          log: '你舍了最稳妥的官路，直接折向海门旧堤，准备趁余党还未站稳南路时先把退路斩断。',
          stats: { reputation: 2, favorSword: 1 },
        },
      },
    ],
  },
  N110: {
    id: 'N110',
    title: '夜封盐港',
    location: '海门盐港外闸',
    content: [
      '你摸清了高仓暗路与册页去向，真正的拦阻却也在盐港外闸彻底现形。私盐护头带着刀手守住栈桥，只等天亮前把人证、残页和巡按的口供一并沉进潮水里。',
      '你不能再只靠赶路了。要么正面压住闸口，要么借刚摸熟的栈桥步法先断他们传讯，再把整座盐港逼进只能亮刀的局面。',
    ],
    choices: [
      {
        id: 'seal-the-wharf-head-on',
        text: '正面压住盐港前闸，逼私盐护头当场亮刀',
        nextNodeId: 'G01',
        battleId: 'salt-port-enforcer',
        effects: {
          log: '你不再藏身，提着兵刃踏上前闸，逼得整座盐港都只能在你面前提前亮刀。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
        },
      },
      {
        id: 'cut-signal-from-catwalk',
        text: '借踏栈步先翻上吊脚廊桥，从高处断掉盐港传讯退路',
        nextNodeId: 'G01',
        battleId: 'salt-port-enforcer',
        requires: {
          martialSkills: ['catwalk-step'],
        },
        effects: {
          log: '你借踏栈步先一步翻上吊脚廊桥，把盐港刀手之间最要紧的传讯退路先断在自己脚下。',
          stats: { reputation: 2, favorSword: 1 },
        },
      },
    ],
  },
  N101: {
    id: 'N101',
    title: '海市翻盘',
    location: '海门鬼市',
    content: [
      '北边的局刚落幕，海门鬼市就有人把旧案余波重新做成了南路海价。盐票、船契、失踪的旧册和几家私盐码头的名字被一并摆上暗桌，人人都想吃下第一口。',
      '你看得很清楚：这一回最值钱的不是哪一卷账，而是谁能趁所有人都心虚的时候先把南边的秤砣握在自己手里。',
    ],
    choices: [
      {
        id: 'buy-the-southern-route',
        text: '吃下南线货路，把京华余波一起做进海价',
        nextNodeId: 'G02',
        effects: {
          log: '你顺势吃下南线货路，把京华旧案留下的惧意也一起折进海价，从此海门每一笔暗账都得先看你的脸色。',
          stats: { favorBlackMarket: 2, debt: 1 },
        },
      },
      {
        id: 'split-the-northern-list-at-sea',
        text: '把北边名单拆成海贸筹码，让新旧买家在海门互相下套',
        nextNodeId: 'G02',
        effects: {
          log: '你把北边带下来的名单拆成几段海贸筹码，故意让新旧买家在海门彼此试探、彼此抬价，最后都只能替你把局做深。',
          stats: { favorBlackMarket: 1, wantedLevel: 1, reputation: 1 },
        },
      },
    ],
  },
  N102: {
    id: 'N102',
    title: '南灯初照',
    location: '海门旧灯塔',
    content: [
      '你循着只属于暗线的旧灯语一路南下，最终在海门外的废灯塔下见到了新的火种。有人把北地送来的讯息拆成三路藏在盐船、渔篷和旧档之间，只等一位能把线重新接起来的人。',
      '京华之后，真正难的已不是让一条暗线活下来，而是让它在更远的地方继续替别人留下活路。',
    ],
    choices: [
      {
        id: 'restart-the-south-lantern-line',
        text: '亲赴灯塔重启南线暗桩，把证人与旧册一起送出海门',
        nextNodeId: 'G04',
        effects: {
          log: '你亲自把废灯塔下沉了多年的暗桩重新点亮，让证人与旧册都能在海门之外找到新的去处。',
          stats: { debt: 1, reputation: 1 },
        },
      },
      {
        id: 'split-the-lantern-code-three-ways',
        text: '把灯语拆成三路，只让后来人各知一节，谁也握不全局',
        nextNodeId: 'G04',
        effects: {
          log: '你没有把整条路交到任何一个人手里，而是把灯语拆成三路，让后来人只能彼此照应着把火继续传下去。',
          stats: { debt: 1, reputation: 2 },
        },
      },
    ],
  },
  N103: {
    id: 'N103',
    title: '潮头再会',
    location: '东南海口',
    content: [
      '你原本已经把京华甩在身后，可海口新起的风声还是追上了你。失踪旧册、南船黑价和一群不愿再被谁摆布的江湖人，正在同一片潮头下慢慢聚拢。',
      '你依旧可以不替谁站到最前，可也正因如此，所有人都想知道：这一次，你究竟会隔岸看多久，又会在什么时候重新伸手拨动局势。',
    ],
    choices: [
      {
        id: 'board-the-tide-and-watch',
        text: '借船入海看各方争夺，把自己留在最后现身的位置',
        nextNodeId: 'G03',
        effects: {
          log: '你借船出海，只远远看着各方在潮头下彼此试探，把真正该现身的时机仍稳稳捏在自己手里。',
          stats: { reputation: 1 },
        },
      },
      {
        id: 'spread-the-capital-echo-south',
        text: '先把京华回声散进海路，再看谁会为谣言先拔刀',
        nextNodeId: 'G03',
        effects: {
          log: '你先把京华那点未散的回声沿海路放了出去，任由谣言替你试出哪些人最怕这册旧账重新浮上海面。',
          stats: { reputation: 1, debt: 1 },
        },
      },
    ],
  },
}
