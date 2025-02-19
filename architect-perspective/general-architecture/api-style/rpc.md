# 远程服务调用

[远程服务调用](https://en.wikipedia.org/wiki/Remote_procedure_call)（Remote Procedure Call，RPC）在计算机科学中已经存在了超过四十年时间，但在今天仍然可以在各种论坛、技术网站上时常遇见“什么是 RPC？”、“如何评价某某 RPC 技术？”、“RPC 更好还是 REST 更好？”之类的问题，仍然“每天”都有新的不同形状的 RPC 轮子被发明制造出来，仍然有层出不穷的文章去比对 Google gRPC、Facebook Thrift 等各家的 RPC 组件库的优劣。

像计算机科学这种知识快速更迭的领域，一项四十岁高龄的技术能有如此关注度，可算是相当稀罕的现象，这一方面是由于微服务风潮带来的热度，另外一方面，也不得不承认，确实有不少开发者对 RPC 本身解决什么问题、如何解决这些问题、为什么要这样解决都或多或少存在认知模糊。本节，笔者会从历史到现状，从表现到本质，尽可能深入地解释清楚 RPC 的来龙去脉。

## 进程间通信

尽管今天的大多数 RPC 技术已经不再追求这个目标了，但无可否认，RPC 出现的最初目的，就是**为了让计算机能够跟调用本地方法一样去调用远程方法**。所以，我们先来看一下本地方法调用时，计算机是如何处理的。笔者通过以下这段 Java 风格的伪代码，来定义几个稍后要用到的概念：

```java
// Caller    :  调用者，代码里的main()
// Callee    ： 被调用者，代码里的println()
// Call Site ： 调用点，即发生方法调用的指令流位置
// Parameter ： 参数，由Caller传递给Callee的数据，即“hello world”
// Retval    ： 返回值，由Callee传递给Caller的数据。以下代码中如果方法能够正常结束，它是void，如果方法异常完成，它是对应的异常
public static void main(String[] args) {
	System.out.println(“hello world”);
}
```

在完全不考虑编译器优化的前提下，程序运行至调用`println()`方法输出`hello world`这行时，计算机（物理机或者虚拟机）要完成以下几项工作。

1. **传递方法参数**：将字符串`helloworld`的引用地址压栈。
2. **确定方法版本**：根据`println()`方法的签名，确定其执行版本。这其实并不是一个简单的过程，不论是编译时静态解析也好，是运行时动态分派也好，总之必须根据某些语言规范中明确定义原则，找到明确的`Callee`，“明确”是指唯一的一个`Callee`，或者有严格优先级的多个`Callee`，譬如不同的重载版本。笔者曾在《[深入理解 Java 虚拟机](https://book.douban.com/subject/34907497/)》中用一整章篇幅介绍该过程，有兴趣的读者可以参考，这里就不赘述了。
3. **执行被调方法**：从栈中弹出`Parameter`的值或引用，以此为输入，执行`Callee`内部的逻辑；这里我们只关心方法如何调用的，不关心方法内部具体是如何执行的。
4. **返回执行结果**：将`Callee`的执行结果压栈，并将程序的指令流恢复到`Call Site`的下一条指令，继续向下执行。

我们再来考虑如果`println()`方法不在当前进程的内存地址空间中，会发生什么问题。不难想到，此时至少面临两个直接的障碍：首先，第一步和第四步所做的传递参数、传回结果都依赖于栈内存的帮助，如果`Caller`与`Callee`分属不同的进程，就不会拥有相同的栈内存，将参数在`Caller`进程的内存中压栈，对于 Callee 进程的执行毫无意义。其次，第二步的的方法版本选择依赖于语言规则的定义，如果`Caller`与`Callee`不是同一种语言实现的程序，方法版本选择就将是一项模糊的不可知行为。

为了简化讨论，我们暂时忽略第二个障碍，假设`Caller`与`Callee`是使用同一种语言实现的，先来解决两个进程之间如何交换数据的问题，这件事情在计算机科学中被称为“[进程间通信](https://en.wikipedia.org/wiki/Inter-process_communication)”（Inter-Process Communication，IPC）。可以考虑的办法有以下几种。

- **管道**（Pipe）或者**具名管道**（Named Pipe）：管道类似于两个进程间的桥梁，可通过管道在进程间传递少量的字符流或字节流。普通管道只用于有亲缘关系进程（由一个进程启动的另外一个进程）间的通信，具名管道摆脱了普通管道没有名字的限制，除具有管道所有的功能外，它还允许无亲缘关系进程间的通信。管道典型的应用就是命令行中的`|`操作符，譬如：

  ```bash
  ps -ef | grep java
  ```

  `ps`与`grep`都有独立的进程，以上命令就通过管道操作符`|`将`ps`命令的标准输出连接到`grep`命令的标准输入上。

- **信号**（Signal）：信号用于通知目标进程有某种事件发生，除了用于进程间通信外，进程还可以发送信号给进程自身。信号的典型应用是`kill`命令，譬如：
  ```bash
  kill -9 pid
  ```
  以上就是由 Shell 进程向指定 PID 的进程发送 SIGKILL 信号。
- **信号量**（Semaphore）：信号量用于两个进程之间同步协作手段，它相当于操作系统提供的一个特殊变量，程序可以在上面进行`wait()`和`notify()`操作。
- **消息队列**（Message Queue）：以上三种方式只适合传递传递少量信息，POSIX 标准中定义了消息队列用于进程间数据量较多的通信。进程可以向队列添加消息，被赋予读权限的进程则可以从队列消费消息。消息队列克服了信号承载信息量少，管道只能用于无格式字节流以及缓冲区大小受限等缺点，但实时性相对受限。
- **共享内存**（Shared Memory）：允许多个进程访问同一块公共的内存空间，这是效率最高的进程间通信形式。原本每个进程的内存地址空间都是相互隔离的，但操作系统提供了让进程主动创建、映射、分离、控制某一块内存的程序接口。当一块内存被多进程共享时，各个进程往往会与其它通信机制，譬如信号量结合使用，来达到进程间同步及互斥的协调操作。
- **套接字接口**（Socket）：以上两种方式只适合单机多进程间的通信，套接字接口是更为普适的进程间通信机制，可用于不同机器之间的进程通信。套接字（Socket）起初是由 UNIX 系统的 BSD 分支开发出来的，现在已经移植到所有主流的操作系统上。出于效率考虑，当仅限于本机进程间通信时，套接字接口是被优化过的，不会经过网络协议栈，不需要打包拆包、计算校验和、维护序号和应答等操作，只是简单地将应用层数据从一个进程拷贝到另一个进程，这种进程间通信方式有个专名的名称：UNIX Domain Socket，又叫做 IPC Socket。

## 通信的成本

之所以花费那么多篇幅来介绍 IPC 的手段，是因为最初计算机科学家们的想法，就是将 RPC 作为 IPC 的一种特例来看待的，这个观点在今天，仅分类上这么说也仍然合理，只是到具体操作手段上不会这么做了。

请特别注意最后一种基于套接字接口的通信方式（IPC Socket），它不仅适用于本地相同机器的不同进程间通信，由于 Socket 是网络栈的统一接口，它也理所当然地能支持基于网络的跨机器的进程间通信。这种通信已经被实践验证过是有效的，譬如 Linux 系统的图形化界面中，X Window 服务器和 GUI 程序之间的交互就是由这套机制来实现。此外，这样做有一个看起来无比诱人的好处，由于 Socket 是各个操作系统都有提供的标准接口，完全有可能把远程方法调用的通信细节隐藏在操作系统底层，从应用层面上看来可以做到远程调用与本地的进程间通信在编码上完全一致。事实上，在[原始分布式时代](/architecture/architect-history/primitive-distribution.html)的早期确实是奔着这个目标去做的，但这种透明的调用形式却反而造成了程序员误以为**通信是无成本的假象**，因而被滥用以致于显著降低了分布式系统的性能。1987 年，在“透明的 RPC 调用”一度成为主流范式的时候，Andrew Tanenbaum 教授曾发表了论文《[A Critique of The Remote Procedure Call Paradigm](https://www.cs.vu.nl/~ast/Publications/Papers/euteco-1988.pdf)》，对这种透明的 RPC 范式提出了一系列质问：

- 两个进程通信，谁作为服务端，谁作为客户端？
- 怎样进行异常处理？异常该如何让调用者获知？
- 服务端出现多线程竞争之后怎么办？
- 如何提高网络利用的效率，譬如连接是否可被多个请求复用以减少开销？是否支持多播？
- 参数、返回值如何表示？应该有怎样的字节序？
- 如何保证网络的可靠性？譬如调用期间某个链接忽然断开了怎么办？
- 发送的请求服务端收不到回复该怎么办？
- ……

论文的中心观点是：本地调用与远程调用当做一样处理，这是犯了方向性的错误，把系统间的调用做成透明，反而会增加程序员工作的复杂度。此后几年，关于 RPC 应该如何发展、如何实现的论文层出不穷，透明通信的支持者有之，反对者有之，冷静分析者有之，狂热唾骂者有之，但历史逐渐证明 Andrew Tanenbaum 的预言是正确的。最终，到 1994 年至 1997 年间，由 ACM 和 Sun 院士[Peter Deutsch](https://en.wikipedia.org/wiki/L._Peter_Deutsch)、套接字接口发明者[Bill Joy](https://en.wikipedia.org/wiki/Bill_Joy)、Java 之父[James Gosling](https://en.wikipedia.org/wiki/James_Gosling)等一众在 Sun Microsystems 工作的大佬们共同总结了[通过网络进行分布式运算的八宗罪](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing)（8 Fallacies of Distributed Computing）：

1. The network is reliable —— 网络是可靠的。
2. Latency is zero —— 延迟是不存在的。
3. Bandwidth is infinite —— 带宽是无限的。
4. The network is secure —— 网络是安全的。
5. Topology doesn't change —— 拓扑结构是一成不变的。
6. There is one administrator —— 总会有一个管理员。
7. Transport cost is zero —— 不必考虑传输成本。
8. The network is homogeneous —— 网络是同质化的。

以上这八条反话被认为是程序员在网络编程中经常被忽略的八大问题，潜台词就是如果远程服务调用要弄透明化的话，就必须为这些罪过埋单，这算是给 RPC 是否能等同于 IPC 来实现**暂时**定下了一个具有公信力的结论。至此，RPC 应该是一种高层次的或者说语言层次的特征，而不是像 IPC 那样，是低层次的或者说系统层次的特征成为工业界、学术界的主流观点。

在 20 世纪 80 年代初期，传奇的[施乐 Palo Alto 研究中心](<https://en.wikipedia.org/wiki/PARC_(company)>)发布了基于 Cedar 语言的 RPC 框架 Lupine，并实现了世界上第一个基于 RPC 的商业应用 Courier，这里施乐 PARC 所定义的“远程服务调用”的概念就是完全符合以上对 RPC 的结论的，所以，尽管此前已经有用其他名词指代“调用远程服务”这种操作，一般仍认为 RPC 的概念最早是由施乐公司所提出的。

:::quote 额外知识：首次提出远程服务调用的定义
Remote procedure call is the synchronous language-level transfer of control between programs in disjoint address spaces whose primary communication medium is a narrow channel.

远程服务调用是指位于互不重合的内存地址空间中的两个程序，在语言层面上，以同步的方式使用带宽有限的信道来传输程序控制信息。

![](./images/rpc.png)

:::right

—— Bruce Jay Nelson，[Remote Procedure Call](http://www.bitsavers.org/pdf/xerox/parc/techReports/CSL-81-9_Remote_Procedure_Call.pdf)，Xerox PARC，1981

:::

## 三个基本问题

20 世纪 80 年代中后期，惠普和 Apollo 提出了[网络运算架构](https://en.wikipedia.org/wiki/Network_Computing_System)（Network Computing Architecture，NCA）的设想，并随后在[DCE 项目](https://en.wikipedia.org/wiki/Distributed_Computing_Environment)中将其发展成在 UNIX 系统下的远程服务调用框架[DCE/RPC](https://zh.wikipedia.org/wiki/DCE/RPC)，笔者曾经在“[原始分布式时代](/architecture/architect-history/primitive-distribution.html)”中介绍过 DEC，这是历史上第一次对分布式有组织的探索尝试，由于 DEC 本身是基于 UNIX 操作系统的，所以 DEC/RPC 通常也仅适合于 UNIX 系统程序之间使用（微软 COM/DCOM 的前身[MS RPC](https://en.wikipedia.org/wiki/Microsoft_RPC)算是 DCE 的一种变体版本，如果把这些派生版算进去的话就要普适一些）。在 1988 年，Sun Microsystems 起草并向[互联网工程任务组](https://en.wikipedia.org/wiki/Internet_Engineering_Task_Force)（Internet Engineering Task Force，IETF）提交了[RFC 1050](https://tools.ietf.org/html/rfc1050)规范，此规范中设计了一套面向于广域网或混合网络环境的、基于 TCP/IP 的、支持 C 语言的 RPC 协议，后被称为[ONC RPC](https://en.wikipedia.org/wiki/Open_Network_Computing_Remote_Procedure_Call)（Open Network Computing RPC，也被称为 Sun RPC），这两套 RPC 协议就算是如今各种 RPC 协议和框架的鼻祖了，从它们开始，直至接下来这几十年来所有流行过的 RPC 协议，都不外乎变着花样使用各种手段来解决以下三个基本问题：

- **如何表示数据**：这里数据包括了传递给方法的参数，以及方法执行后的返回值。无论是将参数传递给另外一个进程，还是从另外一个进程中取回执行结果，都涉及到它们应该如何表示。进程内的方法调用，使用程序语言预置的和程序员自定义的数据类型，就很容易解决数据表示问题，远程方法调用则完全可能面临交互双方各自使用不同程序语言的情况；即使只支持一种程序语言的 RPC 协议，在不同硬件指令集、不同操作系统下，同样的数据类型也完全可能有不一样表现细节，譬如数据宽度、字节序的差异等等。有效的做法是将交互双方所涉及的数据转换为某种事先约定好的中立数据流格式来进行传输，将数据流转换回不同语言中对应的数据类型来进行使用，这个过程说起来拗口，但相信大家一定很熟悉，就是序列化与反序列化。每种 RPC 协议都应该要有对应的序列化协议，譬如：
  - ONC RPC 的[External Data Representation](https://en.wikipedia.org/wiki/External_Data_Representation) （XDR）
  - CORBA 的[Common Data Representation](https://en.wikipedia.org/wiki/Common_Data_Representation)（CDR）
  - Java RMI 的[Java Object Serialization Stream Protocol](https://docs.oracle.com/javase/8/docs/platform/serialization/spec/protocol.html#a10258)
  - gRPC 的[Protocol Buffers](https://developers.google.com/protocol-buffers)
  - Web Service 的[XML Serialization](https://docs.microsoft.com/en-us/dotnet/standard/serialization/xml-serialization-with-xml-web-services)
  - 众多轻量级 RPC 支持的[JSON Serialization](https://tools.ietf.org/html/rfc7159)
  - ……
- **如何传递数据**：准确地说，是指如何通过网络，在两个服务的 Endpoint 之间相互操作、交换数据。这里“交换数据”通常指的是应用层协议，实际传输一般是基于标准的 TCP、UDP 等标准的传输层协议来完成的。两个服务交互不是只扔个序列化数据流来表示参数和结果就行的，许多在此之外信息，譬如异常、超时、安全、认证、授权、事务，等等，都可能产生双方需要交换信息的需求。在计算机科学中，专门有一个名称“[Wire Protocol](https://en.wikipedia.org/wiki/Wire_protocol)”来用于表示这种两个 Endpoint 之间交换这类数据的行为，常见的 Wire Protocol 有：
  - Java RMI 的[Java Remote Message Protocol](https://docs.oracle.com/javase/8/docs/platform/rmi/spec/rmi-protocol3.html)（JRMP，也支持[RMI-IIOP](https://zh.wikipedia.org/w/index.php?title=RMI-IIOP&action=edit&redlink=1)）
  - CORBA 的[Internet Inter ORB Protocol](https://en.wikipedia.org/wiki/General_Inter-ORB_Protocol)（IIOP，是 GIOP 协议在 IP 协议上的实现版本）
  - DDS 的[Real Time Publish Subscribe Protocol](https://en.wikipedia.org/wiki/Data_Distribution_Service)（RTPS）
  - Web Service 的[Simple Object Access Protocol](https://en.wikipedia.org/wiki/SOAP)（SOAP）
  - 如果要求足够简单，双方都是 HTTP Endpoint，直接使用 HTTP 协议也是可以的（如 JSON-RPC）
  - ……
- **如何确定方法**：这在本地方法调用中并不是太大的问题，编译器或者解释器会根据语言规范，将调用的方法签名转换为进程空间中子过程入口位置的指针。不过一旦要考虑不同语言，事情又立刻麻烦起来，每门语言的方法签名都可能有所差别，所以“如何表示同一个方法”，“如何找到对应的方法”还是得弄个跨语言的统一的标准才行。这个标准做起来可以非常简单，譬如直接给程序的每个方法都规定一个唯一的、在任何机器上都绝不重复的编号，调用时压根不管它什么方法签名是如何定义的，直接传这个编号就能找到对应的方法。这种听起既粗鲁又寒碜的办法，还真的就是 DCE/RPC 当初准备的解决方案。虽然最终 DCE 还是弄出了一套语言无关的[接口描述语言](https://en.wikipedia.org/wiki/Interface_description_language)（Interface Description Language，IDL），成为此后许多 RPC 参考或依赖的基础（如 CORBA 的 OMG IDL），但那个唯一的绝不重复的编码方案[UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)（Universally Unique Identifier）却也被保留且广为流传开来，今天已广泛应用于程序开发的方方面面。类似地，用于表示方法的协议还有：
  - Android 的[Android Interface Definition Language](https://developer.android.com/guide/components/aidl)（AIDL）
  - CORBA 的[OMG Interface Definition Language](https://www.omg.org/spec/IDL)（OMG IDL）
  - Web Service 的[Web Service Description Language](https://zh.wikipedia.org/wiki/WSDL)（WSDL）
  - JSON-RPC 的[JSON Web Service Protocol](https://en.wikipedia.org/wiki/JSON-WSP)（JSON-WSP）
  - ……

以上 RPC 中的三个基本问题，全部都可以在本地方法调用过程中找到相对应的操作。RPC 的想法始于本地方法调用，尽管早已不再追求实现成与本地方法调用完全一致，但其设计思路仍然带有本地方法调用的深刻烙印，抓住两者间的联系来类比，对我们更深刻地理解 RPC 的本质会很有好处。

## 统一的 RPC

DEC/RPC 与 ONC RPC 都有很浓厚的 Unix 痕迹，其实并没有真正在 Unix 系统以外大规模流行过，而且它们还有一个“大问题”：只支持传递值而不支持传递对象，尽管 ONC RPC 的 XDR 的序列化器能用于序列化结构体，但结构体毕竟也不是对象，这两门 RPC 协议都是面向 C 语言设计的，根本就没有对象的概念。然而上世纪 90 年代正好又是[面向对象编程](https://en.wikipedia.org/wiki/Object-oriented_programming)（Object-Oriented Programming，OOP）风头正盛的年代，所以在 1991 年，[对象管理组织](https://zh.wikipedia.org/wiki/%E5%AF%B9%E8%B1%A1%E7%AE%A1%E7%90%86%E7%BB%84%E7%BB%87)（Object Management Group，OMG）发布了跨进程的、面向异构语言的、支持面向对象的服务调用协议：CORBA 1.0（Common Object Request Broker Architecture）。CORBA 的 1.0 和 1.1 版本只提供了 C、C++语言的支持，到了末代的 CORBA 3.0 版本，不仅支持了 C、C++、Java、Object Pascal、Python、Ruby 等多种主流编程语言，还支持了 Lisp、Smalltalk、Ada、COBOL 等已经半截入土的非主流语言，阵营不可谓不强大。CORBA 是一套由国际标准组织牵头，由多家软件提供商共同参与的分布式规范，当时影响力只有微软私有的[DCOM](https://zh.wikipedia.org/wiki/Distributed_COM)能够与之稍微抗衡，但微软的 DCOM 与 DCE 一样，是受限于操作系统的（尽管 DCOM 比 DCE 更强大些，能跨多语言），所以同时支持跨系统、跨语言的 CORBA 原本是最有机会统一 RPC 这个领域的有力竞争者。

但无奈 CORBA 本身设计得实在是太过于啰嗦繁琐，甚至有些规定简直到了荒谬的程度——写一个对象请求代理（ORB，这是 CORBA 中的核心概念）大概要 200 行代码，其中大概有 170 行都是纯粹无用的废话——这句带有鞭尸性质的得罪人的评价不是笔者写的，是 CORBA 的首席科学家 Michi Henning 在文章《[The Rise and Fall of CORBA](https://dl.acm.org/doi/pdf/10.1145/1142031.1142044)》的愤怒批评。另一方面，为 CORBA 制定规范的专家逐渐脱离实际，做出 CORBA 规范晦涩难懂，各家语言的厂商都有自己的解读，结果各门语言最终出来的 CORBA 实现互不兼容，实在是对 CORBA 号称支持众多异构语言的莫大讽刺。这也间接造就了稍后 W3C Web Service 出现后，CORBA 与 Web Service 竞争时犹如十八路诸侯讨董卓，互乱阵脚一触即溃的惨败局面。CORBA 的最终归宿是与 DCOM 一同被扫进计算机历史的博物馆中。

CORBA 没有把握住统一 RPC 的大好机遇，很快另外一个更有希望的机会再次降临。1998 年，XML 1.0 发布，并成为[万维网联盟](https://en.wikipedia.org/wiki/World_Wide_Web_Consortium)（World Wide Web Consortium，W3C）的推荐标准。1999 年末，SOAP 1.0（Simple Object Access Protocol）规范的发布，它代表着一种被称为“Web Service”的全新的 RPC 协议的诞生。Web Service 是由微软和 DevelopMentor 公司共同起草的远程服务协议，随后提交给 W3C 投票成为国际标准，所以 Web Service 也被称为 W3C Web Service。Web Service 采用了 XML 作为远程过程调用的序列化、接口描述、服务发现等所有编码的载体，当时 XML 是计算机工业最新的银弹，只要是定义为 XML 的东西几乎就都被认为是好的，风头一时无两，连微软自己都主动宣布放弃 DCOM，迅速转投 Web Service 的怀抱。

交给 W3C 管理后，Web Service 再没有天生属于哪家公司的烙印，商业运作非常成功，大量的厂商都想分一杯羹。但从技术角度来看，它设计得也并不优秀，甚至同样可以说是有显著缺陷的。对于开发者而言，Web Service 的一大缺点是它那过于严格的数据和接口定义所带来的性能问题，尽管 Web Service 吸取了 CORBA 失败的教训，不需要程序员手工去编写对象的描述和服务代理，可是，XML 作为一门描述性语言本身信息密度就相对低下（都不用与二进制协议比，与今天的 JSON 或 YAML 比一下就知道了），Web Service 又是跨语言的 RPC 协议，这使得一个简单的字段，为了在不同语言中不会产生歧义，要以 XML 严谨描述的话，往往需要比原本存储这个字段值多出十几倍、几十倍乃至上百倍的空间。这个特点一方面导致了使用 Web Service 必须要专门的客户端去调用和解析 SOAP 内容，也需要专门的服务去部署（如 Java 中的 Apache Axis/CXF），更关键的是导致了每一次数据交互都包含大量的冗余信息，性能奇差。

如果只是需要客户端、传输性能差也就算了，又不是不能用。既然选择了 XML，获得自描述能力，本来也就没有打算把性能放到第一位，但 Web Service 还有另外一点原罪：贪婪。“贪婪”是指它希望在一套协议上一揽子解决分布式计算中可能遇到的所有问题，这促使 Web Service 生出了一整个家族的协议出来——去网上[搜索一下](https://en.wikipedia.org/wiki/List_of_web_service_specifications)就知道这句话不是拟人修辞。Web Service 协议家族中，除它本身包括的 SOAP、WSDL、UDDI 协议外，还有一堆几乎说不清有多少个、以 WS-\*命名的、用于解决事务、一致性、事件、通知、业务描述、安全、防重放等子功能协议，子子孙孙无穷无尽，对开发者造成了非常沉重的学习负担，这次算是真得罪惨了开发者，谁爱用谁用去。

当程序员们对 Web Service 的热情迅速兴起，又逐渐冷却之后，自己也不禁开始反思：那些面向透明的、简单的 RPC 协议，如 DCE/RPC、DCOM、Java RMI，要么依赖于操作系统，要么依赖于特定语言，总有一些先天约束；那些面向通用的、普适的 RPC 协议；如 CORBA，就无法逃过使用复杂性的困扰，CORBA 烦琐的 OMG IDL、ORB 都是很好的佐证；而那些意图通过技术手段来屏蔽复杂性的 RPC 协议，如 Web Service，又不免受到性能问题的束缚。简单、普适、高性能这三点，似乎真的难以同时满足。

## 分裂的 RPC

由于一直没有一个同时满足以上三点的“完美 RPC 协议”出现，所以远程服务器调用这个小小的领域里，逐渐进入了群雄混战、百家争鸣的战国时代，距离“统一”是越来越远，并一直延续至今。现在，已经相继出现过 RMI（Sun/Oracle）、Thrift（Facebook/Apache）、Dubbo（阿里巴巴/Apache）、gRPC（Google）、Motan1/2（新浪）、Finagle（Twitter）、brpc（百度/Apache）、.NET Remoting（微软）、Arvo（Hadoop）、JSON-RPC 2.0（公开规范，JSON-RPC 工作组）……等等难以穷举的协议和框架。这些 RPC 功能、特点不尽相同，有的是某种语言私有，有的能支持跨越多门语言，有的运行在应用层 HTTP 协议之上，有的能直接运行于传输层 TCP/UDP 协议之上，但肯定不存在哪一款是“最完美的 RPC”。今时今日，任何一款具有生命力的 RPC 框架，都不再去追求大而全的“完美”，而是有自己的针对性特点作为主要的发展方向，举例分析如下。

- 朝着**面向对象**发展，不满足于 RPC 将面向过程的编码方式带到分布式，希望在分布式系统中也能够进行跨进程的面向对象编程，代表为 RMI、.NET Remoting，之前的 CORBA 和 DCOM 也可以归入这类，这条线有一个别名叫做[分布式对象](https://en.wikipedia.org/wiki/Distributed_object)（Distributed Object）。
- 朝着**性能**发展，代表为 gRPC 和 Thrift。决定 RPC 性能的主要就两个因素：序列化效率和信息密度。序列化效率很好理解，序列化输出结果的容量越小，速度越快，效率自然越高；信息密度则取决于协议中有效荷载（Payload）所占总传输数据的比例大小，使用传输协议的层次越高，信息密度就越低，SOAP 使用 XML 拙劣的性能表现就是前车之鉴。gRPC 和 Thrift 都有自己优秀的专有序列化器，而传输协议方面，gRPC 是基于 HTTP/2 的，支持多路复用和 Header 压缩，Thrift 则直接基于传输层的 TCP 协议来实现，省去了额外应用层协议的开销。
- 朝着**简化**发展，代表为 JSON-RPC，说要选功能最强、速度最快的 RPC 可能会很有争议，但选功能弱的、速度慢的，JSON-RPC 肯定会候选人中之一。牺牲了功能和效率，换来的是协议的简单轻便，接口与格式都更为通用，尤其适合用于 Web 浏览器这类一般不会有额外协议支持、额外客户端支持的应用场合。
- ……

经历了 RPC 框架的战国时代，开发者们终于认可了不同的 RPC 框架所提供的特性或多或少是有矛盾的，很难有某一种框架说“我全部都要”。要把面向对象那套全搬过来，就注定不会太简单，如建 Stub、Skeleton 就很烦了，即使由 IDL 生成也很麻烦；功能多起来，协议就要弄得复杂，效率一般就会受影响；要简单易用，那很多事情就必须遵循约定而不是配置才行；要重视效率，那就需要采用二进制的序列化器和较底层的传输协议，支持的语言范围容易受限。也正是每一种 RPC 框架都有不完美的地方，所以才导致不断有新的 RPC 轮子出现，决定了选择框架时在获得一些利益的同时，要付出另外一些代价。

到了最近几年，RPC 框架有明显的朝着更高层次（不仅仅负责调用远程服务，还管理远程服务）与插件化方向发展的趋势，不再追求独立地解决 RPC 的全部三个问题（表示数据、传递数据、表示方法），而是将一部分功能设计成扩展点，让用户自己去选择。框架聚焦于提供核心的、更高层次的能力，譬如提供负载均衡、服务注册、可观察性等方面的支持。这一类框架的代表有 Facebook 的 Thrift 与阿里的 Dubbo。尤其是断更多年后重启的 Dubbo 表现得更为明显，它默认有自己的传输协议（Dubbo 协议），同时也支持其他协议；默认采用 Hessian 2 作为序列化器，如果你有 JSON 的需求，可以替换为 Fastjson，如果你对性能有更高的追求，可以替换为[Kryo](https://github.com/EsotericSoftware/kryo)、[FST](https://github.com/RuedigerMoeller/fast-serialization)、Protocol Buffers 等效率更好的序列化器，如果你不想依赖其他组件库，直接使用 JDK 自带的序列化器也是可以的。这种设计在一定程度上缓和了 RPC 框架必须取舍，难以完美的缺憾。

最后，笔者提个问题，大家不妨来反思一下：开发一个分布式系统，是不是就一定要用 RPC 呢？RPC 的三大问题源自于对本地方法调用的类比模拟，如果我们把思维从“方法调用”的约束中挣脱，那参数与结果如何表示、方法如何表示、数据如何传递这些问题都会海阔天空，拥有焕然一新的视角。但是我们写程序，真的可能不面向方法来编程吗？这就是笔者下一节准备谈的话题了。

---

**后记**：前文提及的 DCOM、CORBA、Web Service 的失败时，可能笔者的口吻多少有一些戏虐，这只是落笔行文的方式，这些框架即使没有成功，但作为早期的探索先驱，并没有什么该去讽刺的地方。而且它们的后续发展，都称得上是知耻后勇的表现，反而值得我们去赞赏。譬如说到 CORBA 的消亡，OMG 痛定思痛之后，提出了基于 RTPS 协议栈的“[数据分发服务](https://en.wikipedia.org/wiki/Data_Distribution_Service)”商业标准（Data Distribution Service，DDS，“商业”就是要付费使用的意思），如今主要流行于物联网领域，能够做到微秒级延时，还能支持大规模并发通信。譬如说到 DCOM 的失败和 Web Service 的式微，微软在它们的基础上推出的[.NET WCF](https://en.wikipedia.org/wiki/Windows_Communication_Foundation)（Windows Communication Foundation，Windows 通信基础），不仅同时将 REST、TCP、SOAP 等不同形式的调用自动封装为完全一致的如同本地方法调用一般的程序接口，还依靠自家的“地表最强 IDE”Visual Studio 将工作量减少到只需要指定一个远程服务地址，就可以获取服务描述、绑定各种特性（譬如安全传输）、自动生成客户端调用代码、甚至还能选择同步还是异步之类细节的程度。尽管这东西只支持.NET 平台，而且与传统 Web Service 一样采用 XML 描述，但使用起来体验真的是异常地畅快，能挽回 Web Service 中得罪开发者丢掉的全部印象分。
