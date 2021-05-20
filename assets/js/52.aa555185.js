(window.webpackJsonp=window.webpackJsonp||[]).push([[52],{430:function(e,t,n){e.exports=n.p+"assets/img/cap.290d0a22.png"},598:function(e,t,n){"use strict";n.r(t);var v=n(11),r=Object(v.a)({},(function(){var e=this,t=e.$createElement,v=e._self._c||t;return v("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[v("h1",{attrs:{id:"分布式事务"}},[e._v("分布式事务")]),e._v(" "),v("p",[e._v("本章中所说的分布式事务（Distributed Transaction）特指多个服务同时访问多个数据源的事务处理机制，请注意它与"),v("a",{attrs:{href:"https://en.wikipedia.org/wiki/Distributed_transaction",target:"_blank",rel:"noopener noreferrer"}},[e._v("DTP模型"),v("OutboundLink")],1),e._v("中“分布式事务”的差异。DTP模型所指的“分布式”是相对于数据源而言的，并不涉及服务，这部分内容已经在“"),v("RouterLink",{attrs:{to:"/architect-perspective/general-architecture/transaction/global.html"}},[e._v("全局事务")]),e._v("”一节里进行过讨论。本节所指的“分布式”是相对于服务而言的，如果严谨地说，它更应该被称为“在分布式服务环境下的事务处理机制”。")],1),e._v(" "),v("p",[e._v("在2000年以前，人们曾经寄希望于XA的事务机制可以在本节所说的分布式环境中也能良好地应用，但这个美好的愿望今天已经被CAP理论彻底地击碎了，接下来就先从CAP与ACID的矛盾说起。")]),e._v(" "),v("h2",{attrs:{id:"cap与acid"}},[e._v("CAP与ACID")]),e._v(" "),v("p",[e._v("CAP定理（Consistency、Availability、Partition Tolerance Theorem），也称为Brewer定理，起源于在2000年7月，是加州大学伯克利分校的Eric Brewer教授于“ACM分布式计算原理研讨会（PODC）”上提出的一个猜想。")]),e._v(" "),v("div",{staticClass:"custom-block center"},[v("p",[v("img",{attrs:{src:n(430),alt:""}}),e._v("\n图3-5 "),v("a",{attrs:{href:"https://people.eecs.berkeley.edu/~brewer/cs262b-2004/PODC-keynote.pdf",target:"_blank",rel:"noopener noreferrer"}},[e._v("CAP理论原稿"),v("OutboundLink")],1),e._v("（那时候还只是猜想）")])]),e._v(" "),v("p",[e._v("两年之后，麻省理工学院的Seth Gilbert和Nancy Lynch以严谨的数学推理上证明了CAP猜想。自此，CAP正式从猜想变为分布式计算领域所公认的著名定理。这个定理里描述了一个分布式的系统中，涉及共享数据问题时，以下三个特性最多只能同时满足其中两个：")]),e._v(" "),v("ul",[v("li",[v("strong",[e._v("一致性")]),e._v("（"),v("strong",[e._v("C")]),e._v("onsistency）：代表数据在任何时刻、任何分布式节点中所看到的都是符合预期的。一致性在分布式研究中是有严肃定义、有多种细分类型的概念，以后讨论分布式共识算法时，我们还会再提到一致性，那种面向副本复制的一致性与这里面向数据库状态的一致性严格来说并不完全等同，具体差别我们将在后续分布式共识算法中再作探讨。")]),e._v(" "),v("li",[v("strong",[e._v("可用性")]),e._v("（"),v("strong",[e._v("A")]),e._v("vailability）：代表系统不间断地提供服务的能力，理解可用性要先理解与其密切相关两个指标：可靠性（Reliability）和可维护性（Serviceability）。可靠性使用平均无故障时间（Mean Time Between Failure，MTBF）来度量；可维护性使用平均可修复时间（Mean Time To Repair，MTTR）来度量。可用性衡量系统可以正常使用的时间与总时间之比，其表征为：A=MTBF/（MTBF+MTTR），即可用性是由可靠性和可维护性计算得出的比例值，譬如99.9999%可用，即代表平均年故障修复时间为32秒。")]),e._v(" "),v("li",[v("strong",[e._v("分区容忍性")]),e._v("（"),v("strong",[e._v("P")]),e._v("artition Tolerance）：代表分布式环境中部分节点因网络原因而彼此失联后，即与其他节点形成“网络分区”时，系统仍能正确地提供服务的能力。")])]),e._v(" "),v("p",[e._v("单纯只列概念，CAP是比较抽象的，笔者仍以本章开头所列的"),v("RouterLink",{attrs:{to:"/architect-perspective/general-architecture/transaction/"}},[e._v("场景事例")]),e._v("来说明这三种特性对分布式系统来说将意味着什么。假设Fenix's Bookstore的服务拓扑如图3-6所示，一个来自最终用户的交易请求，将交由账号、商家和仓库服务集群中某一个节点来完成响应：")],1),e._v(" "),v("mermaid",{staticStyle:{margin:"-15px 0 -30px 0"}},[e._v('\ngraph TB\n\tUser("最终用户")--\x3eStore("Fenix\'s Bookstore")\n\tStore--\x3eWarehouse("仓库服务集群")\n\tStore--\x3eBusiness("商家服务集群")\n\tStore--\x3eAccount("账号服务集群")\n    subgraph\n    Warehouse-.->Warehouse1("仓库节点1")\n    Warehouse-.->Warehouse2("仓库节点2")\n    Warehouse--\x3eWarehouseN("仓库节点N")\n    end\n    subgraph\n    Business-.->Business1("商家节点1")\n    Business--\x3eBusiness2("商家节点2")\n    Business-.->BusinessN("商家节点N")\n    end\n    subgraph\n    Account--\x3eAccount1("账号节点1")\n    Account-.->Account2("账号节点2")\n    Account-.->AccountN("账号节点N")\n    end\n')]),e._v(" "),v("div",{staticClass:"custom-block center"},[v("p",[e._v("图3-6 Fenix's Bookstore的服务拓扑示意图")])]),e._v(" "),v("p",[e._v("在这套系统中，每一个单独的服务节点都有自己的数据库（这里是为了便于说明问题的假设，在实际生产系统中，一般应避免将用户余额这样的数据设计成存储在多个可写的数据库中），假设某次交易请求分别由“账号节点1”、“商家节点2”、“仓库节点N”联合进行响应。当用户购买一件价值100元的商品后，账号节点1首先应给该用户账号扣减100元货款，它在自己数据库扣减100元很容易，但它还要把这次交易变动告知本集群的节点2到节点N，并要确保能正确变更商家和仓库集群其他账号节点中的关联数据，此时将面临以下可能的情况。")]),e._v(" "),v("ul",[v("li",[e._v("如果该变动信息没有及时同步给其他账号节点，将导致有可能发生用户购买另一商品时，被分配给到另一个节点处理，由于看到账号上有不正确的余额而错误地发生了原本无法进行的交易，此为一致性问题。")]),e._v(" "),v("li",[e._v("如果由于要把该变动信息同步给其他账号节点，必须暂时停止对该用户的交易服务，直至数据同步一致后再重新恢复，将可能导致用户在下一次购买商品时，因系统暂时无法提供服务而被拒绝交易，此为可用性问题。")]),e._v(" "),v("li",[e._v("如果由于账号服务集群中某一部分节点，因出现网络问题，无法正常与另一部分节点交换账号变动信息，此时服务集群中无论哪一部分节点对外提供的服务都可能是不正确的，整个集群能否承受由于部分节点之间的连接中断而仍然能够正确地提供服务，此为分区容忍性。")])]),e._v(" "),v("p",[e._v("以上还仅仅涉及了账号服务集群自身的CAP问题，对于整个Fenix's Bookstore站点来说，它更是面临着来自于账号、商家和仓库服务集群带来的CAP问题，譬如，用户账号扣款后，由于未及时通知仓库服务中的全部节点，导致另一次交易中看到仓库里有不正确的库存数据而发生超售。又譬如因涉及仓库中某个商品的交易正在进行，为了同步用户、商家和仓库的交易变动，而暂时锁定该商品的交易服务，导致了的可用性问题，等等。")]),e._v(" "),v("p",[e._v("由于CAP定理已有严格的证明，本节不去探讨为何CAP不可兼得，而是直接分析如果舍弃C、A、P时所带来的不同影响。")]),e._v(" "),v("ul",[v("li",[v("strong",[e._v("如果放弃分区容错性")]),e._v("（CA without P），意味着我们将假设节点之间通信永远是可靠的。永远可靠的通信在分布式系统中必定不成立的，这不是你想不想的问题，而是只要用到网络来共享数据，分区现象就会始终存在。在现实中，最容易找到放弃分区容错性的例子便是传统的关系数据库集群，这样的集群虽然依然采用由网络连接的多个节点来协同工作，但数据却不是通过网络来实现共享的。以Oracle的RAC集群为例，它的每一个节点均有自己独立的SGA、重做日志、回滚日志等部件，但各个节点是通过共享存储中的同一份数据文件和控制文件来获取数据的，通过共享磁盘的方式来避免出现网络分区。因而Oracle RAC虽然也是由多个实例组成的数据库，但它并不能称作是分布式数据库。")]),e._v(" "),v("li",[v("strong",[e._v("如果放弃可用性")]),e._v("（CP without A），意味着我们将假设一旦网络发生分区，节点之间的信息同步时间可以无限制地延长，此时，问题相当于退化到前面“全局事务”中讨论的一个系统使用多个数据源的场景之中，我们可以通过2PC/3PC等手段，同时获得分区容错性和一致性。在现实中，选择放弃可用性的CP系统情况一般用于对数据质量要求很高的场合中，除了DTP模型的分布式数据库事务外，著名的HBase也是属于CP系统，以HBase集群为例，假如某个RegionServer宕机了，这个RegionServer持有的所有键值范围都将离线，直到数据恢复过程完成为止，这个过程要消耗的时间是无法预先估计的。")]),e._v(" "),v("li",[v("strong",[e._v("如果放弃一致性")]),e._v("（AP without C），意味着我们将假设一旦发生分区，节点之间所提供的数据可能不一致。选择放弃一致性的AP系统目前是设计分布式系统的主流选择，因为P是分布式网络的天然属性，你再不想要也无法丢弃；而A通常是建设分布式的目的，如果可用性随着节点数量增加反而降低的话，很多分布式系统可能就失去了存在的价值，除非银行、证券这些涉及金钱交易的服务，宁可中断也不能出错，否则多数系统是不能容忍节点越多可用性反而越低的。目前大多数NoSQL库和支持分布式的缓存框架都是AP系统，以Redis集群为例，如果某个Redis节点出现网络分区，那仍不妨碍各个节点以自己本地存储的数据对外提供缓存服务，但这时有可能出现请求分配到不同节点时返回给客户端的是不一致的数据。")])]),e._v(" "),v("p",[e._v("读到这里，不知道你是否对“选择放弃一致性的AP系统目前是设计分布式系统的主流选择”这个结论感到一丝无奈，本章讨论的话题“事务”原本的目的就是获得“一致性”，而在分布式环境中，“一致性”却不得不成为通常被牺牲、被放弃的那一项属性。但无论如何，我们建设信息系统，终究还是要确保操作结果至少在最终交付的时候是正确的，这句话的意思是允许数据在中间过程出错（不一致），但应该在输出时被修正过来。为此，人们又重新给一致性下了定义，将前面我们在CAP、ACID中讨论的一致性称为“"),v("a",{attrs:{href:"https://en.wikipedia.org/wiki/Strong_consistency",target:"_blank",rel:"noopener noreferrer"}},[e._v("强一致性"),v("OutboundLink")],1),e._v("”（Strong Consistency），有时也称为“"),v("a",{attrs:{href:"https://en.wikipedia.org/wiki/Linearizability",target:"_blank",rel:"noopener noreferrer"}},[e._v("线性一致性"),v("OutboundLink")],1),e._v("”（Linearizability，通常是在讨论"),v("RouterLink",{attrs:{to:"/distribution/consensus/"}},[e._v("共识算法")]),e._v("的场景中），而把牺牲了C的AP系统又要尽可能获得正确的结果的行为称为追求“弱一致性”。不过，如果单纯只说“弱一致性”那其实就是“不保证一致性”的意思……人类语言这东西真的是博大精深。在弱一致性里，人们又总结出了一种稍微强一点的特例，被称为“"),v("a",{attrs:{href:"https://en.wikipedia.org/wiki/Eventual_consistency",target:"_blank",rel:"noopener noreferrer"}},[e._v("最终一致性"),v("OutboundLink")],1),e._v("”（Eventual Consistency），它是指：如果数据在一段时间之内没有被另外的操作所更改，那它最终将会达到与强一致性过程相同的结果，有时候面向最终一致性的算法也被称为“乐观复制算法”。")],1),e._v(" "),v("p",[e._v("在本节讨论的主题“分布式事务”中，目标同样也不得不从之前三种事务模式追求的强一致性，降低为追求获得“最终一致性”。由于一致性的定义变动，“事务”一词的含义其实也同样被拓展了，人们把使用ACID的事务称为“刚性事务”，而把笔者下面将要介绍几种分布式事务的常见做法统称为“柔性事务”。")]),e._v(" "),v("h2",{attrs:{id:"可靠事件队列"}},[e._v("可靠事件队列")]),e._v(" "),v("p",[e._v("最终一致性的概念是eBay的系统架构师Dan Pritchett在2008年在ACM发表的论文《"),v("a",{attrs:{href:"https://queue.acm.org/detail.cfm?id=1394128",target:"_blank",rel:"noopener noreferrer"}},[e._v("Base: An Acid Alternative"),v("OutboundLink")],1),e._v("》中提出的，该论文总结了一种独立于ACID获得的强一致性之外的、使用BASE来达成一致性目的的途径。BASE分别是基本可用性（"),v("strong",[e._v("B")]),e._v("asically "),v("strong",[e._v("A")]),e._v("vailable）、柔性事务（"),v("strong",[e._v("S")]),e._v("oft State）和最终一致性（"),v("strong",[e._v("E")]),e._v("ventually Consistent）的缩写。BASE这提法简直是把数据库科学家酷爱凑缩写的恶趣味发挥到淋漓尽致，不过有ACID vs BASE（酸 vs 碱）这个朗朗上口的梗，该论文的影响力的确传播得足够快。在这里笔者就不多谈BASE中的概念问题了，虽然调侃它是恶趣味，但这篇论文本身作为最终一致性的概念起源，并系统性地总结了一种针对分布式事务的技术手段，是非常有价值的。")]),e._v(" "),v("p",[e._v("我们继续以本章的场景事例来解释Dan Pritchett提出的“可靠事件队列”的具体做法，目标仍然是交易过程中正确修改账号、仓库和商家服务中的数据，图3-7列出了修改过程的时序图。")]),e._v(" "),v("mermaid",{staticStyle:{"margin-bottom":"0px"}},[e._v("\nsequenceDiagram\n\tFenix's Bookstore ->>+ 账号服务: 启动事务\n\t账号服务 ->> 账号服务: 扣减货款\n\t账号服务 ->>- 消息队列: 提交本地事务，发出消息\n\tloop 循环直至成功\n\t\t消息队列 ->> 仓库服务: 扣减库存\n\t\talt 扣减成功\n        \t仓库服务 --\x3e> 消息队列: 成功\n\t\telse 业务或网络异常\n        \t仓库服务 --\x3e> 消息队列: 失败\n\t\tend\n\tend\n\t消息队列 --\x3e> 账号服务: 更新消息表，仓库服务完成\n\tloop 循环直至成功\n\t\t消息队列 ->> 商家服务: 货款收款\n\t\talt 收款成功\n        \t商家服务 --\x3e> 消息队列: 成功\n\t\telse 业务或网络异常\n        \t商家服务 --\x3e> 消息队列: 失败\n\t\tend\n\tend\n\t消息队列 --\x3e> 账号服务: 更新消息表，商家服务完成\n")]),e._v(" "),v("div",{staticClass:"custom-block center"},[v("p",[e._v("图3-7 具体修改步骤时序图")])]),e._v(" "),v("ol",[v("li",[e._v("最终用户向Fenix's Bookstore发送交易请求：购买一本价值100元的《深入理解Java虚拟机》。")]),e._v(" "),v("li",[e._v("Fenix's Bookstore首先应对用户账号扣款、商家账号收款、库存商品出库这三个操作有一个出错概率的先验评估，根据出错概率的大小来安排它们的操作顺序，这种评估一般直接体现在程序代码中，有一些大型系统也可能会实现动态排序。譬如，根据统计，最有可能的出现的交易异常是用户购买了商品，但是不同意扣款，或者账号余额不足；其次是仓库发现商品库存不够，无法发货；风险最低的是收款，如果到了商家收款环节，一般就不会出什么意外了。那顺序就应该安排成最容易出错的最先进行，即：账号扣款 → 仓库出库 → 商家收款。")]),e._v(" "),v("li",[e._v("账号服务进行扣款业务，如扣款成功，则在自己的数据库建立一张消息表，里面存入一条消息：“事务ID：某UUID，扣款：100元（状态：已完成），仓库出库《深入理解Java虚拟机》：1本（状态：进行中），某商家收款：100元（状态：进行中）”，注意，这个步骤中“扣款业务”和“写入消息”是使用同一个本地事务写入账号服务自己的数据库的。")]),e._v(" "),v("li",[e._v("在系统中建立一个消息服务，定时轮询消息表，将状态是“进行中”的消息同时发送到库存和商家服务节点中去（也可以串行地发，即一个成功后再发送另一个，但在我们讨论的场景中没必要）。这时候可能产生以下几种情况。\n"),v("ol",[v("li",[e._v("商家和仓库服务都成功完成了收款和出库工作，向用户账号服务器返回执行结果，用户账号服务把消息状态从“进行中”更新为“已完成”。整个事务宣告顺利结束，达到最终一致性的状态。")]),e._v(" "),v("li",[e._v("商家或仓库服务中至少一个因网络原因，未能收到来自用户账号服务的消息。此时，由于用户账号服务器中存储的消息状态一直处于“进行中”，所以消息服务器将在每次轮询的时候持续地向未响应的服务重复发送消息。这个步骤的可重复性决定了所有被消息服务器发送的消息都必须具备幂等性，通常的设计是让消息带上一个唯一的事务ID，以保证一个事务中的出库、收款动作会且只会被处理一次。")]),e._v(" "),v("li",[e._v("商家或仓库服务有某个或全部无法完成工作，譬如仓库发现《深入理解Java虚拟机》没有库存了，此时，仍然是持续自动重发消息，直至操作成功（譬如补充了新库存），或者被人工介入为止。由此可见，可靠事件队列只要第一步业务完成了，后续就没有失败回滚的概念，只许成功，不许失败。")]),e._v(" "),v("li",[e._v("商家和仓库服务成功完成了收款和出库工作，但回复的应答消息因网络原因丢失，此时，用户账号服务仍会重新发出下一条消息，但因操作具备幂等性，所以不会导致重复出库和收款，只会导致商家、仓库服务器重新发送一条应答消息，此过程重复直至双方网络通信恢复正常。")]),e._v(" "),v("li",[e._v("也有一些支持分布式事务的消息框架，如RocketMQ，原生就支持分布式事务操作，这时候上述情况2、4也可以交由消息框架来保障。")])])])]),e._v(" "),v("p",[e._v("以上这种靠着持续重试来保证可靠性的解决方案谈不上是Dan Pritchett的首创或者独创，它在计算机的其他领域中已被频繁使用，也有了专门的名字叫作“"),v("a",{attrs:{href:"https://en.wikipedia.org/wiki/Best-effort_delivery",target:"_blank",rel:"noopener noreferrer"}},[e._v("最大努力交付"),v("OutboundLink")],1),e._v("”（Best-Effort Delivery），譬如TCP协议中未收到ACK应答自动重新发包的可靠性保障就属于最大努力交付。而可靠事件队列还有一种更普通的形式，被称为“最大努力一次提交”（Best-Effort 1PC），指的就是将最有可能出错的业务以本地事务的方式完成后，采用不断重试的方式（不限于消息系统）来促使同一个分布式事务中的其他关联业务全部完成。")]),e._v(" "),v("h2",{attrs:{id:"tcc事务"}},[e._v("TCC事务")]),e._v(" "),v("p",[e._v("TCC是另一种常见的分布式事务机制，它是“Try-Confirm-Cancel”三个单词的缩写，是由数据库专家Pat Helland在2007年撰写的论文《"),v("a",{attrs:{href:"https://www-db.cs.wisc.edu/cidr/cidr2007/papers/cidr07p15.pdf",target:"_blank",rel:"noopener noreferrer"}},[e._v("Life beyond Distributed Transactions: An Apostate’s Opinion"),v("OutboundLink")],1),e._v("》中提出。")]),e._v(" "),v("p",[e._v("前面介绍的可靠消息队列虽然能保证最终的结果是相对可靠的，过程也足够简单（相对于TCC来说），但整个过程完全没有任何隔离性可言，有一些业务中隔离性是无关紧要的，但有一些业务中缺乏隔离性就会带来许多麻烦。譬如在本章的场景事例中，缺乏隔离性会带来的一个显而易见的问题便是“超售”：完全有可能两个客户在短时间内都成功购买了同一件商品，而且他们各自购买的数量都不超过目前的库存，但他们购买的数量之和却超过了库存。如果这件事情处于刚性事务，且隔离级别足够的情况下是可以完全避免的，譬如，以上场景就需要“可重复读”（Repeatable Read）的隔离级别，以保证后面提交的事务会因为无法获得锁而导致失败，但用可靠消息队列就无法保证这一点，这部分属于数据库本地事务方面的知识，可以参考前面的讲解。如果业务需要隔离，那架构师通常就应该重点考虑TCC方案，该方案天生适合用于需要强隔离性的分布式事务中。")]),e._v(" "),v("p",[e._v("在具体实现上，TCC较为烦琐，它是一种业务侵入式较强的事务方案，要求业务处理过程必须拆分为“预留业务资源”和“确认/释放消费资源”两个子过程。如同TCC的名字所示，它分为以下三个阶段。")]),e._v(" "),v("ul",[v("li",[v("strong",[e._v("Try")]),e._v("：尝试执行阶段，完成所有业务可执行性的检查（保障一致性），并且预留好全部需用到的业务资源（保障隔离性）。")]),e._v(" "),v("li",[v("strong",[e._v("Confirm")]),e._v("：确认执行阶段，不进行任何业务检查，直接使用Try阶段准备的资源来完成业务处理。Confirm阶段可能会重复执行，因此本阶段所执行的操作需要具备幂等性。")]),e._v(" "),v("li",[v("strong",[e._v("Cancel")]),e._v("：取消执行阶段，释放Try阶段预留的业务资源。Cancel阶段可能会重复执行，也需要满足幂等性。")])]),e._v(" "),v("p",[e._v("按照我们的"),v("RouterLink",{attrs:{to:"/architect-perspective/general-architecture/transaction/"}},[e._v("场景事例")]),e._v("，TCC的执行过程应该如图3-8所示。")],1),e._v(" "),v("mermaid",{staticStyle:{"margin-bottom":"0px"}},[e._v("\nsequenceDiagram\n\tFenix's Bookstore ->> 账号服务: 业务检查，冻结货款\n\talt 成功\n\t\t账号服务 --\x3e> Fenix's Bookstore: 记录进入Confirm阶段\n\telse 业务或网络异常\n\t\t账号服务 --\x3e> Fenix's Bookstore: 记录进入Cancel阶段\n\tend\n\tFenix's Bookstore ->> 仓库服务: 业务检查，冻结商品\n\talt 成功\n\t\t仓库服务 --\x3e> Fenix's Bookstore: 记录进入Confirm阶段\n\telse 业务或网络异常\n\t\t仓库服务 --\x3e> Fenix's Bookstore: 记录进入Cancel阶段\n\tend\n\tFenix's Bookstore ->> 商家服务: 业务检查\n\talt 成功\n\t\t商家服务 --\x3e> Fenix's Bookstore: 记录进入Confirm阶段\n\telse 业务或网络异常\n\t\t商家服务 --\x3e> Fenix's Bookstore: 记录进入Cancel阶段\n\tend\n    opt 全部记录均返回Confirm阶段\n\t\tloop 循环直至全部成功\n        \tFenix's Bookstore->>账号服务: 完成业务，扣减冻结的货款\n        \tFenix's Bookstore->>仓库服务: 完成业务，扣减冻结的货物\n        \tFenix's Bookstore->>商家服务: 完成业务，货款收款\n\t\tend\n    end\n    opt 任意服务超时或返回Cancel阶段\n\t\tloop 循环直至全部成功\n        \tFenix's Bookstore->>账号服务:取消业务，解冻货款\n        \tFenix's Bookstore->>仓库服务:取消业务， 解冻货物\n        \tFenix's Bookstore->>商家服务:取消业务\n\t\tend\n    end\n")]),e._v(" "),v("div",{staticClass:"custom-block center"},[v("p",[e._v("图3-8 TCC的执行过程")])]),e._v(" "),v("ol",[v("li",[e._v("最终用户向Fenix's Bookstore发送交易请求：购买一本价值100元的《深入理解Java虚拟机》。")]),e._v(" "),v("li",[e._v("创建事务，生成事务ID，记录在活动日志中，进入Try阶段：\n"),v("ul",[v("li",[e._v("用户服务：检查业务可行性，可行的话，将该用户的100元设置为“冻结”状态，通知下一步进入Confirm阶段；不可行的话，通知下一步进入Cancel阶段。")]),e._v(" "),v("li",[e._v("仓库服务：检查业务可行性，可行的话，将该仓库的1本《深入理解Java虚拟机》设置为“冻结”状态，通知下一步进入Confirm阶段；不可行的话，通知下一步进入Cancel阶段。")]),e._v(" "),v("li",[e._v("商家服务：检查业务可行性，不需要冻结资源。")])])]),e._v(" "),v("li",[e._v("如果第2步所有业务均反馈业务可行，将活动日志中的状态记录为Confirm，进入Confirm阶段：\n"),v("ul",[v("li",[e._v("用户服务：完成业务操作（扣减那被冻结的100元）。")]),e._v(" "),v("li",[e._v("仓库服务：完成业务操作（标记那1本冻结的书为出库状态，扣减相应库存）。")]),e._v(" "),v("li",[e._v("商家服务：完成业务操作（收款100元）。")])])]),e._v(" "),v("li",[e._v("第3步如果全部完成，事务宣告正常结束，如果第3步中任何一方出现异常，不论是业务异常或者网络异常，都将根据活动日志中的记录，重复执行该服务的Confirm操作，即进行最大努力交付。")]),e._v(" "),v("li",[e._v("如果第2步有任意一方反馈业务不可行，或任意一方超时，将活动日志的状态记录为Cancel，进入Cancel阶段：\n"),v("ul",[v("li",[e._v("用户服务：取消业务操作（释放被冻结的100元）。")]),e._v(" "),v("li",[e._v("仓库服务：取消业务操作（释放被冻结的1本书）。")]),e._v(" "),v("li",[e._v("商家服务：取消业务操作（大哭一场后安慰商家谋生不易）。")])])]),e._v(" "),v("li",[e._v("第5步如果全部完成，事务宣告以失败回滚结束，如果第5步中任何一方出现异常，不论是业务异常或者网络异常，都将根据活动日志中的记录，重复执行该服务的Cancel操作，即进行最大努力交付。")])]),e._v(" "),v("p",[e._v("由上述操作过程可见，TCC其实有点类似2PC的准备阶段和提交阶段，但TCC是位于用户代码层面，而不是在基础设施层面，这为它的实现带来了较高的灵活性，可以根据需要设计资源锁定的粒度。TCC在业务执行时只操作预留资源，几乎不会涉及锁和资源的争用，具有很高的性能潜力。但是TCC并非纯粹只有好处，它也带来了更高的开发成本和业务侵入性，意味着有更高的开发成本和更换事务实现方案的替换成本，所以，通常我们并不会完全靠裸编码来实现TCC，而是基于某些分布式事务中间件（譬如阿里开源的"),v("a",{attrs:{href:"https://seata.io/zh-cn/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Seata"),v("OutboundLink")],1),e._v("）去完成，尽量减轻一些编码工作量。")]),e._v(" "),v("h2",{attrs:{id:"saga事务"}},[e._v("SAGA事务")]),e._v(" "),v("p",[e._v("TCC事务具有较强的隔离性，避免了“超售”的问题，而且其性能一般来说是本篇提及的几种柔性事务模式中最高的，但它仍不能满足所有的场景。TCC的最主要限制是它的业务侵入性很强，这里并不是重复上一节提到的它需要开发编码配合所带来的工作量，而更多的是指它所要求的技术可控性上的约束。譬如，把我们的场景事例修改如下：由于中国网络支付日益盛行，现在用户和商家在书店系统中可以选择不再开设充值账号，至少不会强求一定要先从银行充值到系统中才能进行消费，允许直接在购物时通过U盾或扫码支付，在银行账号中划转货款。这个需求完全符合国内网络支付盛行的现状，却给系统的事务设计增加了额外的限制：如果用户、商家的账号余额由银行管理的话，其操作权限和数据结构就不可能再随心所欲的地自行定义，通常也就无法完成冻结款项、解冻、扣减这样的操作，因为银行一般不会配合你的操作。所以TCC中的第一步Try阶段往往无法施行。我们只能考虑采用另外一种柔性事务方案：SAGA事务。SAGA在英文中是“长篇故事、长篇记叙、一长串事件”的意思。")]),e._v(" "),v("p",[e._v("SAGA事务模式的历史十分悠久，还早于分布式事务概念的提出。它源于1987年普林斯顿大学的Hector Garcia-Molina和Kenneth Salem在ACM发表的一篇论文《"),v("a",{attrs:{href:"https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf",target:"_blank",rel:"noopener noreferrer"}},[e._v("SAGAS"),v("OutboundLink")],1),e._v("》（这就是论文的全名）。文中提出了一种提升“长时间事务”（Long Lived Transaction）运作效率的方法，大致思路是把一个大事务分解为可以交错运行的一系列子事务集合。原本SAGA的目的是避免大事务长时间锁定数据库的资源，后来才发展成将一个分布式环境中的大事务分解为一系列本地事务的设计模式。SAGA由两部分操作组成。")]),e._v(" "),v("ul",[v("li",[e._v("大事务拆分若干个小事务，将整个分布式事务T分解为n个子事务，命名为T"),v("sub",[e._v("1")]),e._v("，T"),v("sub",[e._v("2")]),e._v("，…，T"),v("sub",[e._v("i")]),e._v("，…，T"),v("sub",[e._v("n")]),e._v("。每个子事务都应该是或者能被视为是原子行为。如果分布式事务能够正常提交，其对数据的影响（最终一致性）应与连续按顺序成功提交T"),v("sub",[e._v("i")]),e._v("等价。")]),e._v(" "),v("li",[e._v("为每一个子事务设计对应的补偿动作，命名为C"),v("sub",[e._v("1")]),e._v("，C"),v("sub",[e._v("2")]),e._v("，…，C"),v("sub",[e._v("i")]),e._v("，…，C"),v("sub",[e._v("n")]),e._v("。T"),v("sub",[e._v("i")]),e._v("与C"),v("sub",[e._v("i")]),e._v("必须满足以下条件：\n"),v("ul",[v("li",[e._v("T"),v("sub",[e._v("i")]),e._v("与C"),v("sub",[e._v("i")]),e._v("都具备幂等性。")]),e._v(" "),v("li",[e._v("T"),v("sub",[e._v("i")]),e._v("与C"),v("sub",[e._v("i")]),e._v("满足交换律（Commutative），即先执行T"),v("sub",[e._v("i")]),e._v("还是先执行C"),v("sub",[e._v("i")]),e._v("，其效果都是一样的。")]),e._v(" "),v("li",[e._v("C"),v("sub",[e._v("i")]),e._v("必须能成功提交，即不考虑C"),v("sub",[e._v("i")]),e._v("本身提交失败被回滚的情形，如出现就必须持续重试直至成功，或者要人工介入。")])])])]),e._v(" "),v("p",[e._v("如果T"),v("sub",[e._v("1")]),e._v("到T"),v("sub",[e._v("n")]),e._v("均成功提交，那事务顺利完成，否则，要采取以下两种恢复策略之一：")]),e._v(" "),v("ul",[v("li",[v("strong",[e._v("正向恢复")]),e._v("（Forward Recovery）：如果T"),v("sub",[e._v("i")]),e._v("事务提交失败，则一直对T"),v("sub",[e._v("i")]),e._v("进行重试，直至成功为止（最大努力交付）。这种恢复方式不需要补偿，适用于事务最终都要成功的场景，譬如在别人的银行账号中扣了款，就一定要给别人发货。正向恢复的执行模式为：T"),v("sub",[e._v("1")]),e._v("，T"),v("sub",[e._v("2")]),e._v("，…，T"),v("sub",[e._v("i")]),e._v("（失败），T"),v("sub",[e._v("i")]),e._v("（重试）…，T"),v("sub",[e._v("i+1")]),e._v("，…，T"),v("sub",[e._v("n")]),e._v("。")]),e._v(" "),v("li",[v("strong",[e._v("反向恢复")]),e._v("（Backward Recovery）：如果T"),v("sub",[e._v("i")]),e._v("事务提交失败，则一直执行C"),v("sub",[e._v("i")]),e._v("对T"),v("sub",[e._v("i")]),e._v("进行补偿，直至成功为止（最大努力交付）。这里要求C"),v("sub",[e._v("i")]),e._v("必须（在持续重试后）执行成功。反向恢复的执行模式为：T"),v("sub",[e._v("1")]),e._v("，T"),v("sub",[e._v("2")]),e._v("，…，T"),v("sub",[e._v("i")]),e._v("（失败），C"),v("sub",[e._v("i")]),e._v("（补偿），…，C"),v("sub",[e._v("2")]),e._v("，C"),v("sub",[e._v("1")]),e._v("。")])]),e._v(" "),v("p",[e._v("与TCC相比，SAGA不需要为资源设计冻结状态和撤销冻结的操作，补偿操作往往要比冻结操作容易实现得多。譬如，前面提到的账号余额直接在银行维护的场景，从银行划转货款到Fenix's Bookstore系统中，这步是经由用户支付操作（扫码或U盾）来促使银行提供服务；如果后续业务操作失败，尽管我们无法要求银行撤销掉之前的用户转账操作，但是由Fenix's Bookstore系统将货款转回到用户账上作为补偿措施却是完全可行的。")]),e._v(" "),v("p",[e._v("SAGA必须保证所有子事务都得以提交或者补偿，但SAGA系统本身也有可能会崩溃，所以它必须设计成与数据库类似的日志机制（被称为SAGA Log）以保证系统恢复后可以追踪到子事务的执行情况，譬如执行至哪一步或者补偿至哪一步了。另外，尽管补偿操作通常比冻结/撤销容易实现，但保证正向、反向恢复过程的能严谨地进行也需要花费不少的工夫，譬如通过服务编排、可靠事件队列等方式完成，所以，SAGA事务通常也不会直接靠裸编码来实现，一般也是在事务中间件的基础上完成，前面提到的Seata就同样支持SAGA事务模式。")]),e._v(" "),v("p",[e._v("基于数据补偿来代替回滚的思路，还可以应用在其他事务方案上，这些方案笔者就不开独立小节，放到这里一起来解释。举个具体例子，譬如阿里的GTS（Global Transaction Service，Seata由GTS开源而来）所提出的“"),v("a",{attrs:{href:"https://seata.io/zh-cn/docs/overview/what-is-seata.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("AT事务模式"),v("OutboundLink")],1),e._v("”就是这样的一种应用。")]),e._v(" "),v("p",[e._v("从整体上看是AT事务是参照了XA两段提交协议实现的，但针对XA 2PC的缺陷，即在准备阶段必须等待所有数据源都返回成功后，协调者才能统一发出Commit命令而导致的"),v("a",{attrs:{href:"https://en.wikipedia.org/wiki/Liebig's_law_of_the_minimum",target:"_blank",rel:"noopener noreferrer"}},[e._v("木桶效应"),v("OutboundLink")],1),e._v("（所有涉及的锁和资源都需要等待到最慢的事务完成后才能统一释放），设计了针对性的解决方案。大致的做法是在业务数据提交时自动拦截所有SQL，将SQL对数据修改前、修改后的结果分别保存快照，生成行锁，通过本地事务一起提交到操作的数据源中，相当于自动记录了重做和回滚日志。如果分布式事务成功提交，那后续清理每个数据源中对应的日志数据即可；如果分布式事务需要回滚，就根据日志数据自动产生用于补偿的“逆向SQL”。基于这种补偿方式，分布式事务中所涉及的每一个数据源都可以单独提交，然后立刻释放锁和资源。这种异步提交的模式，相比起2PC极大地提升了系统的吞吐量水平。而代价就是大幅度地牺牲了隔离性，甚至直接影响到了原子性。因为在缺乏隔离性的前提下，以补偿代替回滚并不一定是总能成功的。譬如，当本地事务提交之后、分布式事务完成之前，该数据被补偿之前又被其他操作修改过，即出现了脏写（Dirty Wirte），这时候一旦出现分布式事务需要回滚，就不可能再通过自动的逆向SQL来实现补偿，只能由人工介入处理了。")]),e._v(" "),v("p",[e._v("通常来说，脏写是一定要避免的，所有传统关系数据库在最低的隔离级别上都仍然要加锁以避免脏写，因为脏写情况一旦发生，人工其实也很难进行有效处理。所以GTS增加了一个“全局锁”（Global Lock）的机制来实现写隔离，要求本地事务提交之前，一定要先拿到针对修改记录的全局锁后才允许提交，没有获得全局锁之前就必须一直等待，这种设计以牺牲一定性能为代价，避免了有两个分布式事务中包含的本地事务修改了同一个数据，从而避免脏写。在读隔离方面，AT事务默认的隔离级别是读未提交（Read Uncommitted），这意味着可能产生脏读（Dirty Read）。也可以采用全局锁的方案解决读隔离问题，但直接阻塞读取的话，代价就非常大了，一般不会这样做。由此可见，分布式事务中没有一揽子包治百病的解决办法，因地制宜地选用合适的事务处理方案才是唯一有效的做法。")])],1)}),[],!1,null,null,null);t.default=r.exports}}]);