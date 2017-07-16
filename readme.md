## 安装和配置
+ cd C:\Program Files\MongoDB 2.6 Standard\bin
+ mongod --dbpath D:\software\MongoDBDATA #数据的存储路径
+ 配置环境变量:  
      C:\Program Files\MongoDB 2.6 Standard\bin配置到path下面(jdk类似)
+ 启动数据库服务  
      批处理文件 mongod --dbpath D:\software\MongoDBDATA
+ 启动监听端口号27017
      mongo 127.0.0.1:27017/admin
+ 启动数据库配置的服务文件  
      mongod.exe --logpath "C:\data\dbConf\mongodb.log" --logappend --dbpath "C:\data\db" --serviceName "mongo" --serviceDisplayName "mongodb" --install

----------------
# 第一讲: 使用和创建数据库
1. 创建一个数据库
    + use [databasename] 但是你什么都不干就离开的话这个空数据库就会被删除
    + 并没有被创建,只是在预处理缓存中, 只有为这个数据库添加模板集合后才创建
2. 查看所有的数据库
    + show dbs
3. 给指定的数据库添加集合并且添加记录
    + db.persons.insert({name:"fengzx"})(db代表的是当前的数据库 use处使用的)
    + 添加一个集合叫做persons, 给persons添加了一行记录, 会自动创建一个_id
    + db.[documentName].insert({});
4. 查看数据库中所有的文档(相当于查询数据库中所有的表)
    + show collections #(结果) persons system.indexes
5. 查看指定文档的数据(文档相当于table db相当于当前数据库)
    + db.system.indexes.find() #db.[documentName].find()
    + db.persons.find() 查看数据记录
    + db.[documentName].findOne() 查询一条数据(第一条)
6.更新文档数据
    + db.persons.update({name:"fengzx"},{$set:{name:"FZX"}})
    + db.[documentName].update({查询条件},{更新内容})
    + 例子:
        
        ```js
        var p = db.persons.findOne()
        db.persons.update(p,{name:"fengzixin"});
        ```

7. 删除文档中的数据
    + db.[documentName].remove({...});

    ```js
    db.persons.remove({name:"fengzixin"})
    ```

8. 删除库中的集合
    
    ```
    db.[documentName].drop()
    db.persons.drop()
    show collections 查看是否删除成功
    ```

9. 删除数据库

    ```
    db.dropDatabase()
    show dbs 查看是否被删除
    ```

10. shell的help
    + 里面所有的shell可以完成的命令帮助
    + 全局的help
        - 数据库相关的db.help()
        - 集合相关的db.[documentName].help()
        - db.getName() 获取当前正在使用的数据库名称
        - db.stats()  获取数据库的状态
        - db.persons.count() 获取集合的长度
11. mongoDB的API
    + http://api.mongodb.com/js/3.0.6/

    + 数据库和集合的命名规范
        - 不能是空字符串
        - 不得含有'' (空格) $ \ / 和\O(空字符)
        - 应该全部小写
        - 最多64个字节
        - 数据库名也不能与现有系统保留库同名,如admin local config
    + 这样的集合也是合法的
        - db-text,但是不能通过db.[documentName]得到了,要改为db.getCollection(documentName) 因为db-text会被当做减法操作, 但是尽量避免
    + mongoDB的shell内置JavaScript引擎可以直接执行JS代码

        ```
        function insert(object)
        {
          db.getCollection("db-text").insert(object);
        }
        insert({name:fff});
        ```

    + shell可以使用eval  
        db.eval("return 'mongoDB'")
    + BSON是JSON的扩展 它添加了很多诸如日期,浮点等JSON不支持的数据类型
    + MongoVUE安装与使用  
        http://blog.csdn.net/my_wade/article/details/48245565

-------------
# 第二讲:Document操作

## document的插入操作---
  1,插入文档
    dn.[documentName].insert({});
      db.persons.insert({_id:"001",name:"CDT"})
  2,批量插入文档
    shell这样执行是错误的db.[documentName].insert([{},{},{}])
    shell不支持批量插入
    想完成批量插入的话,可以使用mongo的应用驱动或是shell的for循环
    for (var i  = 0; i < 10; i ++)
    {
      db.persons.insert({name:i});
    }
  3,save操作
    save操作和inset操作区别在于当遇到_id相同的情况下,
      save会完成保存操作对数据进行更新操作,insert则会报错


## document的删除操作---
  1,删除列表中的所有数据
    db.[documentName].remove() 集合的本身和索引不会被删除
  2,根据条件进行删除
    删除集合documentName中的name等于upscat的记录
      db.[documentName].remove({name:"upscat"})
      db.persons.remove({_id:1})
  3,小技巧
    如果你想删除一个数据量十分庞大的集合,直接删除该集合并且重新建立索引的办法比直接用remove的效率高很多

## document的更新操作---
  1,强硬的文档替换式更新操作
    db.[documentName].update({查询器},{修改器})
    db.persons.update({name:"yfc"},{age:25}); //第一个是查询器 第二个是修改器
    强硬的更新会用新的文档代替老的文档
  2,主键冲突的时候报错并且停止更新操作
    db.persons.update({_id:2},{_id:1,age:22})
    因为_id为1的已经存在 所以会报错
    因为是强制替换当替换的文档和已有的文档ID冲突的时候则系统回报错
  3,insertOrUpdate操作
    目的:查询器查的出来数据就执行更新操作,查不出来就执行替换操作
    用法:db.[documentName].update({查询器},{修改器},true)
  4,批量更新操作
    update只修改第一个符合条件的数据项 批量更新必须使用$set修改器
    db.persons.update({name:"3"},{$set:{name:"33"}},false,true)

    第三个参数false表示不insert, 第四个参数表示批量修改

    默认情况下当查询器查询出多条数据的时候默认修改第一条数据
    db.[documentName].update({查询器},{$set:{修改器}},false,true)}
  5,使用修改器来完成局部更新操作
    $set    {$set:{field:value}}  {$set:{name:"fengzixin"}}
      执行一个键值对,如果存在就进行修改,不存在就添加
      db.persons.update({name:"chen"},{$set:{name:"cdt"}})
    $inc    {$inc:{field:value}}  {$inc:{"count":1}}
      只能使用与数字类型,也可以为指定的键对应的数字类型的数值进行加减操作
      db.persons.update({age:27},{$inc:{age:1}}) 自动将年龄加1
    $unset  {$unset:{field:1}}    {$unset:{"name":1}}
      删除指定的键
      db.persons.update({age:27},{$unset:{age:1}})
    $push {$push:{field:value}}  {$push:{books:"JS"}}
      1,如果指定的键是数组 增追加新的数值
        db.persons.insert({_id:5,name:'fzx',books:[]})
        db.persons.update({_id:5},{$push:{books:"js"}}) 追加
        db.persons.update({_id:5},{$push:{books:"extjs"}}) 追加
      2,如果指定的键不是数组则中断当前的操作Cann't apply $push /no array
        db.persons.update({_id:5},{$push:{name:"fff"}}) 报错 name不是数组
      3,如果不存在指定的键则创建数组类型的键值对
        db.persons.update({_id:5},{$push:{classes:"class01"}}) 创建追加
    $pushAll  {$pushAll:{field:array}}   {$push:{books:["Extjs","JS"]}
      用法和$push相似 可以批量添加数组数据
      db.persons.update({_id:5},{$pushAll:{classes:["01","02","03","04"]}})
    $addToSet  {$addToSet:{field:value}}   {$addToSet:{books:"JS"}}
      目标数组存在此项 则不进行操作 不存在则添加进去
      db.persons.insert({_id:6,books:["js"]})
      db.persons.update({_id:6},{$addToSet:{books:"js"}})//已经有js不会追加
      db.persons.update({_id:6},{$addToSet:{books:"extjs"}})//没有extjs会追加
    $pop      {$pop:{field:value}}     {$pop:{name:1}}  {$pop:{name:-1}}
      从指定的数组中删除一个值 1删除最后一个数值 -1删除第一个值
      db.persons.update({_id:6},{$pop:{books:-1}}) //删除books的第一个值
    $pull    {$pull:{field:value}}     {$pull:{books:"js"}}
      db.persons.update({_id:6},{$pull:{books:"js"}}) //删除books中指定的值
      删除一个指定的数值
    $pullAll  {$pullAll:{field:array}}     {$pullAll:{books:["js","mongodb"]}
      db.persons.update({_id:6},{$pullAll:{books:["extjs","js"]}})
      一次性删除多个指定的值

    $ {$push:{field:value}} {$push:{books:"JS"}}
      1,数组定位器,如果数组中有多个数值,我们相对其中的一部分进行操作我们就要用到定位器($) 例如:
        有文档{name:"YFC",age:27,books:[{type:'js',name:'extjs'},{type:"js",name:"jquery"},{type:"js",name:"mongodb"}]}
      我们要把type等于js的文档增加一个相同的作者author是fzx
      方法: db.text.update({"books.type":"js"},{$set:{"books.$.author":"fzx"}})

      db.persons.insert({_id:7,books:[{type:"js",name:"jquery"},{type:"js",name:"jquery"},{type:"js",name:"mongodb"}]})
      db.persons.update({"books.type":"js"},{$set:{"books.$.author":"fzx"}})
      //碰到有.引用的地方一定要打双引号""  只修改第一个满足条件的
    切记: 修改器是被放到最前面的,后面学的查询器是要放到内层的

  6,$addToSet与$each结合完成批量数据更新
    db.text.update({_id:1000},{$addToSet:{books:{$each:["js","db"]}}})
    $each会循环后面的数组把每一个值都进行$addToSet操作
  7,存在分配与查询问题
    当document被创建的时候,DB为其分配内存和预留内存,
    当修改操作不超过预留内存的时候,则速度非常快,
    反而,超过了预留内存就要分配新的内存,则会消耗时间
  8,runCommand函数和findAndModify函数
    runCommand可以执行mongoDB中的特殊函数
    findAndModify就是特殊函数之一,用于返回update或者remove之后的文档
    runCommand({"findAndModify":"processes",
      query:{查询器},
      sort:{排序},
      new:true
      update:{更新器},
      remove:true,
      }).value
    //只能针对单文档的操作更新 只能更新可以匹配的第一条数据 不能批量操作
    ps = db.runCommand({
      findAndModify:"persons",
      query:{"name":"fff"},
      update:{$set:{"age":123}},
      new:"true"
    }).value
    doSomething(ps)

----------------
# 第三讲: 查询操作
## FIND详解---
  1,指定返回的键
    db.[documentName].find({条件},{键指定})
    1.1 查询出所有数据的指定键(name,age,country)
      db.persons.find({},{_id:0,name:1,country:1}) 0表示不搜集 1表示搜集
  2,查询条件
    $lt  <                  $lte <=
    $gt  >                  $gte >=          $ne  !=
    2.1 查询出年龄在27到27岁之间的学生
      db.persons.find({age:{$gte:25,$lte:27}},{_id:0,name:1,age:1})
    2.2 查询出所有的不是韩国国籍的学生的数学成绩
      db.persons.find({country:{$ne:"Korea"}},{_id:0,m:1,country:1})
  3,包含或者不包含
    $in或者$nin  只能作用于数组不能作用于其他的对象
    2.3 查询国籍是中国或者美国的学生信息
    db.persons.find({country:{$in:["USA","China"]}},{_id:0,name:1,country:1})
    2.4 查询国籍不是中国或者美国的学生信息
    db.persons.find({country:{$nin:["USA","China"]}},{_id:0,name:1,country:1})
  4,OR查询
    $or
    2.4 查询语文成绩大于85或者英语大于90的学生的信息
      db.persons.find({ $or:[{c:{$gt:85}},{e:{$gt:90}}] }, {_id:0,c:1,e:1})
  5,Null
    把中国国籍的学生上添加新的键sex
      db.persons.update({country:"China"},{$set:{sex:"m"}},false,true)
      //第三个参数false表示不insertOrUpdate 第四个参数true表示批量操作
      db.persons.find({},{_id:0,country:1,sex:1})
    删除中国国籍学生的上的键sex
      db.persons.update({country:"China"},{$unset:{sex:1}},false,true)
    2.5 查询出sex为null的学生
      db.persons.find({sex:{$in:[null]}}, {_id:0,name:1,sex:1})
  6,正则查询
    2.6 查询出名字中存在有 'li' 的学生的信息
      db.persons.find({name:/li/i},{_id:0,name:1})
  7,$not的使用
    $not可以使用到任何地方取反的操作
    2.7 查询出名字中不存在li的学生的信息
      db.persons.find({name:{$not:/li/i}},{_id:0,name:1})
      $not和$nin的区别在于$not可以用在任何地方$nin只能用在集合上面
  8,数组查询$call和index的使用
    2.8 查询习惯看MONGODB和JS的学生(and)
      db.persons.find({books:{$all:["MONGODB","JS"]}},{_id:0,name:1,books:1})
    2.9 查询第二本是JAVA的学习信息(books.index 记得带双引号)
      db.persons.find({"books.1":"JAVA"},{_id:0,name:1,books:1})
  9,查询指定长度的数组$size它不能与比较查询符一起使用(这是弊端)
    2.8 查询出喜欢的书籍数量是四本的学生
      db.persons.find({books:{$size:4}},{_id:0,name:1,books:1})
    2.9 查询出喜欢的书籍数量大于三本的学生
      db.persons.find({books:{$size:{$gt:3}}},{_id:0,name:1,books:1}) (错误)
        上面这种方法写是错误的  因为不能与查询符一起运用
      1,增加字段size
        db.persons.update({books:{$size:4}},{$set:{size:4}},false,true) (批量添加)
      2,改变书籍的更新方式,每次增加书籍的时候size增加1
        db.persons.update({查询器},{$push:{books:"Oracle"},$inc:{size:1}})
      3,利用$gt查询
        db.persons.find({size:{$gt:3}})
    2.10 利用shell查询出JIM喜欢看的书籍的数量
      var persons = db.persons.find({name:"jim"})
      while(persons.hasNext()){
        obj = persons.next();
          print(obj.books.length)
      }
  课间小结
    1,mongoDB是NOSQL数据库但是它在文档查询上还是蛮强大的
    2,查询符基本是用花括号里面的,更新符号基本是在外面的
    3,shell是个彻底的JS引擎,但是一些特殊的操作要靠它的各个驱动包来完成(JAVA,NODE_JS)
  10,$slice操作符返回文档中指定数组的内部值
    2.11 查询出JIM书架中第2~4本书
      db.persons.find({name:"jim"},{books:{$slice:[1,3]},_id:0,name:1})
      第一个参数是查询条件, 第二个参数是展示项 但是这里books不用再写books:1
    2.12 查询出最后一本书
      db.persons.find({name:"jim"},{books:{$slice:-1},_id:0,name:1})
  11,文档查询
    为jim添加学习简历文档jim.json(文件代码)
    2.13查询出在K学校上过学的学生
    1,为这个我们用绝对匹配可以完成,但是有些问题(找找问题?顺序?总是要带着score?)
      db.persons.find({school:{school:"K",score:"A"}},{_id:0,name:1})
      去掉score的话是完全匹配式的,不会有内容查询出来,而且score和school顺序相反的话也查询不出来
    2,为了解决这个问题我们可以用对象"."的方式进行定位
    db.persons.find({"school.score":"A","school.school":"K"},{_id:0,name:1})
    3,这样的问题 看例子
    db.persons.find({"school.score":"A","school.school":"J"},{_id:0,name:1})
      这样查询出来的是个错误 因为在J学校的时候成绩是A+不是A,score和school会去和其他对象对比
    4,正确的做法,单条条件组查询$elemMatch
  db.persons.find({school:{$elemMatch:{school:"K",score:"A"}}},{_id:0,name:1})
  12,$where
    12,查询年龄大于22岁,喜欢看c++书籍,在K学校上过学的学生的信息
      复杂的查询我们可以用$where因为它是万能的,但是我们要避免使用它,因为有性能的代价 where.js(查看文件)

## 分页与查询
      1,Limit返回指定的数据条数
        1.1 查询出persons文档中的前5条数据
        db.persons.find({},{_id:0,name:1}).limit(5)
    2,Skip返回指定数据的跨度
      2.1 查询出persons文档中的5-10条数据
        db.persons.find({},{_id:0,name:1}).limit(5).skip(5)
    3,Sort返回按照年龄排序的数据[1,-1]
      db.persons.find({},{_id:0,name:1,age:1}).limit(5).skip(5).sort({age:1})
      1 表示正序 -1表示倒序
      注意: mongodb的key可以和不同类型的数据排序就也有优先级
        最小值 null 数字 字符串 对象/文档 数组 二进制 对象ID 布尔值 日期
        时间戳->正则->最大值
    4,limit和skip完成分页
      4.1 三条数据为一页进行分页
         db.persons.find({},{_id:0,name:1}).limit(3).skip(0)
         db.persons.find({},{_id:0,name:1}).limit(3).skip(3)
         db.persons.find({},{_id:0,name:1}).limit(3).skip(6)
      4.2 skip有性能问题 没有特殊的情况下我们可以换个思路思考
        对文档重新解构设计
        每次查询操作的时候前后台传值,要把上次最后一个文档的日期保存下来
        db.persons.find({date:{$gt:日期数值}}).limit(3)
        建议:应该把软件的中点放到快捷和精确查询上面不是分页的性能上,因为用户最多不会查过2页的
  游标和其他知识
    1,利用游标遍历查询数据
      var persons = db.persons.find();
      while (persons.hasNext()){
        obj = persons.next();
        print(obj.name)
      }
    2,游标的几个销毁条件
      1,客户端发来消息销毁
      2,游标迭代完毕
      3,默认游标超过十分钟没用就自动销毁
    3,查询快照
      快照后就会针对不变的集合进行游标的运动
      db.persons.find({$query:{name:"jim"},$snapshot:true})
        高级查询选项
        $query
          db.persons.find({$query :{name:"jim"}},{_id:0,name:1})
          相当于db.persons.find({name:"jim"},{_id:0,name:1})
        $orderby      $maxsan      $min    $max
        $explain      $snapshot
    4,为什么有的时候要用到查询快照
      当有一项的内容添加的时候 会扩充,当超过预留内存的时候 变大的数据就会放在集合的后面,变小的数据放在原来的的位置 所以之前索引的值会导致重复读数据 或者漏掉数据 所以用快照

      快照: 将mongoDB中的数据照一张快照保留其位置信息
 
--------------------
# 第四讲 索引管理
## 索引详讲-----
  1,创建简单索引
    数据准备index.js
    1.1 先检验一下查询性能
      var start = new Date()
      db.books.find({number:65871})
      var end = new Date()
      end - start
    1.2 为number创建索引
      db.books.ensureIndex({number:1}) 1表示正序索引 -1表示倒序
    1.3 再执行第一部代码可以看出有数量级的性能提升
  2,索引使用需要注意的地方
    2.1 索引创建的时候注意1是正序的创建索引 -1是倒序的创建索引
    2.2 索引的创建在提高查询性能的时候也会影响插入的性能,对于经常要有查询少插入的文档可以考虑使用索引
    2.3 符合索引要注意索引的先后顺序 {书号,名称} 与{名称,书号}是不同的
    2.4 每个键全建立索引不一定就能提高性能,索引不是万能的
    2.5 在做排序操作的时候,如果遇到超大的数据量也可以考虑加上索引的可以提高排序的性能
  3,索引的名称
    3.1 利用VUE查看索引的名称
      db.books.ensureIndex({number:1}) 创建的索引名称为number_1
    3.2 创建索引同时指定索引的名称
      db.books.ensureIndex({number:-1},{name:"booknameIndex"})
  4,唯一索引
    4.1 如何解决文档books不能插入重复的数据
     建立唯一索引
      db.books.ensureIndex({name:-1},{unique:true})
      db.books.insert({name:"java"})
      db.books.insert({name:"java",number:0}) //报错
      db.books.insert({name:"java"}) //报错
      db.books.insert({name:"java", number:10}) //报错
  5,剔除重复值
    5.1 如果建立唯一索引之前已经有重复数值如何处理
      db.books.ensureIndex({name:1},{unque:true,dropDups:true})
      如果数据库中已经有重复数据情况下建立唯一索引会报错,所以要剔除重复
  6,Hint
    6.1 如何强制查询使用指定的索引呢?
      db.books.find({name:"1book",number:1}).hint({number:1})
      指定索引必须是已经创建了索引
  7,Explain
    7.1 如何详细查询本次查询使用了哪个索引和查询数据时的状态信息
      db.books.find({name:"1book"}).explain()

      cursor:"BtTreeCursor name_-1" 使用索引
      nscanned:1                  查到几个文档
      mills:0                     查询时间为0是很不错的性能

## 索引管理-----
  1,system.indexes
    1.1 在shell中查看数据库中已经建立起来的索引
      db.system.indexes.find()
      db.system.namespaces.find()
  2,后台执行
    2.1 执行创建索引的过程中会暂时锁表问题如何解决
      为了不影响查询我们可以交索引的创建过程在后台执行
      db.books.ensureIndex({name:1},{background:true})
  3,删除索引
    3.1 批量删除和精确删除
      db.runCommand({dropIndexes:"books",index:"name_-1"})
      db.runCommand({dropIndexes:"books",index:"*"})
  -----空间索引-----
  1, mongoDB提供强大的空间索引, 可以查询出一定范围内的地理坐标,看例子
    准备map.json map = [{"gis":{x:1,y:2}}, {"gis":{x:2,y:3}}]
    添加2D索引
      默认会创建一个[-180,180]之间的2D索引
  2, 查询点(70,180)最近的三个点(near邻近查询)
      db.map.find({gis:{$near:[70,180]}},{gis:1,_id:0}).limit(3)
  3, 查询以(50,50)和点(190,190)为对角线的正方形中所有的点(box盒子查询)
      db.map.find({gis:{$within:{$box:[[50,50],[190,190]]}}},{_id:0,gis:1})
  4, 查询以圆心为(55,80),圆心半径为50的圆中的点(center中心查询)
      db.map.find({gis:{$within:{$center:[[55,80],50]}}},{_id:0,gis:1})

-----------
# 第五讲:
## Count+Discount+Group------
  1,Count
    请查询出persons美国学生的人数
      db.persons.find({country:"USA"}).count()
  2,Distinct
    查询出persons中一共有多少个国家分别是什么
      db.runCommand({distinct:"persons",key:"country"}).values
      distinct表示特殊函数 针对persons表, 针对的字段是country 获取values值
  3,Group
    语法:
      db.runCommand({
        group:{
          ns: 集合名字,
          Key:分组的键对象,
          Initial: 初始化累加器,
          $reduce:组分解器,
          Collection:条件,
          Finalize:组完成器
        }
      })
      分组首先按照key进行分组,每一组的每一个文档全要执行$reduce的方法,他会接受两个参数,一个是组内本条记录,一个是累加器数据
    3.1 请查出persons中每一个国家学生数学成绩最好的学生的信息(必须全部90分以上)
      db.runCommand({group:{
        ns:"persons",
        key:{"country":true},
        initial:{m:0}, //m是数学成绩的意思 累加器m赋初始化值为0.
        $reduce:function(doc,prev){//prev表示累加器
          if(doc.m > prev.m){//prev.m表示累加器m的值
            prev.m = doc.m;
            prev.name = doc.name;
            prev.country = doc.country;
          }
        },
        condition:{m:{$gt:90}} //符合的条件参与分组
      }})
    3.2 在3.1的基础上把每一个人的信息链接起来,写一个描述赋值到m上
        db.runCommand({group:{
          ns:"persons",
          key:{"country":true},
          initial:{m:0},
          $reduce:function(doc,prev){
            if(doc.m > prev.m){
              prev.m = doc.m;
              prev.name = doc.name;
              prev.country = doc.country;
            }
          },
          finalize:function(prev){
            prev.m = prev.name+" Math scores "+prev.m
          },
          condition:{m:{$gt:90}}
        }})
  4,用函数格式化分组的键
    4.1 如果集合中出现键Country和counTry同时存在.那分组就有点麻烦
      $key:funcntion(doc){
        return {country:doc.counTry} //return分组的一个条件
      }

      db.runCommand({group:{
        ns:"persons",
        $key:function(doc){
          if(doc.counTry){
            return {country:doc.counTry}
          }else{
            return {country:doc.country}
          }
        },
        initial:{m:0},
        $reduce:function(doc,prev){
          if(doc.m > prev.m){
            prev.m = doc.m;
            prev.name = doc.name;
            if(doc.country){
              prev.country = doc.country;
            }else{
              prev.country = doc.counTry;
            }
          }
        },
        finalize:function(prev){
          prev.m = prev.name+" Math scores "+prev.m
        },
        condition:{m:{$gt:90}}
      }})

## 数据库命令操作------
  1,命令执行器
    1.1 runCommand完成一次删除表的操纵
      db.runCommand({drop:"map"})
  2,如何查询MongoDB为我们提供的命令
      1,在shell中执行 db.listCommands()
      2,访问官网http://localhost:28017/_commands
        需要配置项 mongodb.bat 加上 --rest
  3,常用命令举例
    3.1 查询服务器版本号和主机操作系统
      db.runCommand({buildInfo:1})
    3.2 查询执行集合的详细信息,大小,空间,索引等
      db.runCommand({collStats:"persons"})
    3.3 查看操作本集最后一次错误信息
      db.runCommand({getLastError:"persons"})

## 固定集合特性------
  1,固定集合
  2,固定特性
    2.1固定集合默认是没有索引的,就算是_id也是没有索引的
    2.2由于不需要分配新的控件,所以插入速度是非常快的
    2.3固定集合的顺序是固定的,所以查询速度也是非常的快的
    2.4最适合的应用就是日志管理
  3,创建固定集合
    3.1 创建一个新的固定集合要求大小是100个字节,可以存储文档10个
      db.createCollection("mycoll",{size:100,capped:true,max:10})
    3.2 把一个普通集合转变为固定集合
      db.runCommand({convertToCapped:"persons",size:100000})
  4,反序排序,默认是插入顺序排序
    4.1 查询固定集合mycoll并且反序排序
      db.mycoll.find().sort({$nature:-1})
  5,尾部游标,可惜shell不支持,java和php等驱动是支持的
    5.1 尾部游标概念
      这是个特殊的只能用到固定级和身上的游标,在没有结束的时候,也不会自动销毁,会一直等待结果的到来


  ## GridFS文件系统------
  1,概念
    GridFS是mongoDB自带的文件系统他用二进制的形式存储文件,大型文件系统的绝大多是特性GridFS全可以完成
  2,使用的工具
    mongofiles.exe
  3,使用GridFS
    3.1 查看GridFS的所有功能
      cmd monggofiles
    3.2 上传一个文件
      mongofiles -d foobar -l "E:\a.txt" put "a.txt"
    3.3 查看GridFS的文件存储状态
      利用VUE查看
      集合查看
        db.fs.chunks.find()和db.fs.files.find()存储了文件系统的所有文件信息
    3.4 查看文件内容
      VUE可以查看 shell无法查看 get "a.txt"
    3.5 查看所有的文件
      mongofiles -d foobar list
    3.6 删除已经存在的文件(VUE中操作)
      mongofiles -d foobar delete 'a.txt'

  ------补充->服务器端脚本------
  1,Eval
    1.1 服务器端运行eval
      db.eval("function(name) {return name}","uspcat")
      运行的话: 输入 uspcat
  2,JavaScript的存储
    2.1 在服务器上保存js变量或者函数供全局调用
      1.把变量加载到特殊集合system.js中
        db.system.js.insert({_id:"name",value:"fengzixin"})
      2.调用
        db.eval("return name")

        完成类似存储过程
          db.system.js.insert({_id:"showName",value:function(){return 23}})
          db.eval("showName()")
  system.js相当于Oracle的存储过程,因为value不单单可以写成变量,还可以写成函数体function

---------------------
# 第六讲: MOMGODB服务配置管理
## mongoDB启动配置详解-------
  1,启动项 mongod -help
    --dpath   指定数据库的目录,默认在window下的c:\data\db\
    --port      指定服务器的监听端口号,默认是27017
    --fork      用守护进程的方式启动mongoDB
    --logpath   指定日志的输出路径,默认是控制台
    --config    指定启动项用文件的路径
    --auth      用安全认证的方式启动数据库
    1.1 利用config配置文件来启动数据库 改变端口为8888
      mongodb.conf文件
        dbpath = D:\software\mongod\db
        post:8888
      启动文件
        mongod.exe --config mongodb.conf
      shell文件
        mongo 127.0.0.1:8888
  2,停止mongoDB的服务
    2.1 ctrl+c组合键可以关闭数据库
      use admin
      db.shutdownServer()
    2.2 admin数据库命令关闭数据库

## 导出导入运行时备份-------
  1,导出数据(中断其他操作)
    打开CMD
    利用mongoexport
      -d 指明要使用的库
      -c 指出要导出的表
      -o 指出要导出的文件名称
      -csv 制定要导出的csv的格式
      -q  过滤导出
      --type <json|csv|tsv>
    1.1 把数据库中foobar中的persons导出
      mongoexport -d foobar -c persons -o D:\perosns.json
      另外开启一个cmd的终端 在里面执行语句
    1.2  导出其他主机数据库中的文档
      mongoexport -host 192.168.0.16 --port 37017
  2,导入数据(终端其他操作)
    2.1 导入persons文件
      mongoimport --db foobar --collections persons --file d:\persons.json
  3,运行时备份
    3.1 导出127.0.0.1服务器下27017下的foobar数据库
      mongodump --host 127.0.0.1:27017 -d foobar -o d:\foobar
  4,运行时恢复
    4.1 删除原本的数据库 用刚才导出的数据库进行数据库恢复
      db.dropDatabase()
  mongostore --host 127.0.0.1:27017 -d foobar -directoryperdb d:\foobar\foobar
  5,懒人备份
    mongoDB是文件数据库,这其实就可以拷贝文件的方式进行备份

## Fsync锁,数据修复-------
  1,Fsync的使用
    上锁:可以叫做缓冲池的数据全部进入数据库,这在数据库备份的时候很有意义
      db.runCommand({sync:1,lock:1})
    解锁
      db.currentOp()
  2,数据修复
    当停电等不可逆转灾难来临的时候,由于mongoDB的存储结构导致会产生垃圾数据,在数据修复以后这边的垃圾数据依然存在,这时数据库提供一个自我修复能力
      db.repairDatabase()

## 用户管理,安全认证-------
  1,添加一个用户
    1.1 为admin添加user用户和foobar数据库的fzx用户
      use admin
      db.addUser("admin","fzx")
      use foobar
      db.addUser("fzx","123")
      进行认证
        db.auth("admin","fzx")
      如果忘记密码, 在开启服务器的脚本中去除掉auth认证, 重新开启
        use admin
        db.system.users.remove({})
  2,启用用户
    db.auth("名称","密码")
  3,删除用户操作
    db.system.users.remove({user:"admin"})

-----------------------
# 第七讲: 主从复制和副本集
## 主从复制---------
  1,主从复制是一个简单的数据库同步备份的集群技术
    1.1 在数据库集群中要明确的指导谁是主服务器,主服务器只有一台
    1.2 从服务器要知道自己的数据源也就是对于主服务是谁
    1.3 --master用来确定主服务器, --save和--source来控制增服务器
    1.4 主从复制集群案例
      dbpath = D:\software\mongoDBDATA\07\8888 主数据库地址 (需要创建文件夹)
      port = 8888主数据库端口号
      bind_ip = 127.0.0.1 主数据库所在服务器
      mater = true 确定我是主服务器

      dbpath = D:\software\mongoDBDATA\07\7777 从数据库地址
      port = 7777          从数据库端口号
      bind_ip = 127.0.0.1 从数据库所在服务器
      source = 127.0.0.1:8888 确定主数据库端口数据源 即谁是我的主人
      slave = true   确定自己是从服务器#这个配置项(source)可以用shell动态添加
  2,主从复制的其他设置项
    --only 从节点-->指定复制到某个数据库,默认是赋值全部数据库
      指定需要备份的数据库
    --slavedelay 从节点-->设置主数据库同步数据的延迟(单位是秒)
      从数据库延迟一定的事件后从主服务器进行备份
    --fastsync 从节点-->以主数据库的节点快照为节点启动从数据库
      马上将内存中的数据写入主服务器中,然后从数据库进行备份
    --autoresync 从节点-->如果不同规则则重新同步数据库
      如果不设置,将从当前时间节点复制, 而当前时间段以前的不复制
    --oplogSize 主节点-->设置oplog的大小(主节点操作记录存储在local的oplog中)

    主从复制的机制
      主要是考oplogSet日志空间, 把主数据库的操作都记录下来,从数据库就是从这写日志中拿到这些操作的记录,然后在自己的数据库中执行这些操作, 日志空间越大存储数据越多.
  3,利用shell动态添加和删除从节点
    db.sources.find() 隐式集合在从节点的local数据库中,7777端口控制台中
      use local
      db.sources.find()

    不难看出从节点关于主节点的信息全部存到local的source的集合中,我们只要对集合进行操作,就可以动态的操作主从关系,手动的添加从服务器(修改配置文件)
      首先把7777的配置文件中的source注释掉,不告诉它主服务器是哪一个
      挂接主节点操作之前只留下从数据库服务
        首先开启8888服务 监听端口
        打开mongo 127.0.0.1:7777
        show dbs
        use local
        db.sources.find()
        db.sources.insert({host:"127.0.0.1:8888"})
      删除已经挂接的主节点操作之前留下从数据库服务
        db.source.remove({"host":"127.0.0.1:8888"})

## 副本集---------
  1,副本集的概念
    A是活跃的,B和C是用于备份的服务器
    当A出现故障的时候,这时候集群根据权重算法推选出B为活跃的数据库
    当A恢复以后A自动变成为备份数据库

    A服务器配置
      dbpath= D:\software\MongoDBDATA\07\7777
      port = 7777
      bind_ip = 127.0.0.1
      replSet = child/127.0.0.1:8888 #设定同伴
    B服务器配置
      dbpath= D:\software\mongoDBDATA\07\8888
      port = 8888
      bind_ip = 127.0.0.1
      replSet = child/127.0.0.1:9999 #设定同伴
    C服务器配置
      dbpath= D:\software\mongoDBDATA\07\9999
      port = 9999
      bind_ip = 127.0.0.1
      replSet = child/127.0.0.1:7777 #设定同伴
  2,初始化副本集
    2.1首先打开服务器 然后监听端口
    2.2在一端口服务器中执行以下代码
      use admin
      db.runCommand({
        "replSetInitiate":{
          _id:"child",
          members:[
            {
              _id:1,
              host:"127.0.0.1:7777"
            },
            {
              _id:2,
              host:"127.0.0.1:8888"
            },{
              _id:3,
              host:"127.0.0.1:9999"
            },
          ]
        }
      })
    2.3 查看副本集 rs.status()
          从节点不能执行查询操作
    2.4 关掉主服务器,查看哪一个成了主服务器
    2.5 重新开启关闭的端口的服务器,查看其是否变成了从服务器

  3,节点和初始化高级参数
    standard常规节点:参与投票,有可能成为活跃节点
    passive副本节点:参与投票,但是不能成为活跃节点
    arbiter仲裁节点:只是参与投票,不复制节点,也不能成为活跃节点
  4,高级参数
    Priority 0到100之间 0代表副本节点, 1到100代表常规节点
    arbiterOnly: true仲裁节点
    用法:
      members:[
        {
          _id:1,
          host:"127.0.0.1:7777",
          arbiterOnly:true
        }
      ]
  5,优先级相同时仲裁组建原则
    A,B,C优先级相同, A活跃节点BC副本集, B在1秒之前复制更新,C在5秒复制更新
    A发生故障的时候,会选择B为活跃服务器,即选择复制最近的时候的节点
  6,读写分离操作-->扩展读
    6.1 一般情况下座位副本的节点是不能进行数据库操作的,但是在读取密集型的系统中读写分离是十分必要的, 即A服务器负责读操作, B服务器负责写操作,提高数据库服务性能

    6.2设置读写分离
      slaveOnly:true
      在shell中无法掩饰,这个特性是被写入到mongoDB的驱动程序中的在Java和node等其他语言中可以完成
  7,Oplog
    是存在于本地数据库的local中的,每一个文档保证这一个节点的操作,如果想故障恢复更彻底,oplog尽量设置的大一些以保存更多的操作信息
      改变oplog的大小
      主库 --master --oplogSize size

-----------------------
# 第八讲:切片
  1,插入负载技术-->分片架构
    分区,配置服务器 ---> 路由 <---> 用户
  2,片键的概念和用处
    利用key为片键进行自动分片
  3,什么时候用到分片
    3.1机器的空间磁盘不足
    3.2单个的mongoDB服务器已经不能满足大量的插入和删除
    3.3想通过把大数据放到内存中来提高性能
  4,分片的步骤
    4.1 创建一个配置服务器
      配置服务器相当于一个普通的mongoDB数据库服务
        dbpath = D:\software\MongoDBDATA\08\config
        port = 2000
        bind_ip = 127.0.0.1
    4.2创建路由服务器,并且连接配置服务器
      路由器是调用mongos命令
      mongos --port 1000 --configdb 127.0.0.1:2000 #创建路由器监听配置服务器
      mongo 127.0.0.1:1000/admin  #mongo_1000.bat启动驱动路由器
    4.3 添加两个分片数据库
      8081和8082 在mongoDBDATA文件中创建需要的文件夹8081 8082 config
    4.4 利用路由器为集群添加分片(允许本地访问)
      先启用配置服务器 再启动路由器 再启动80881 8082服务器
      db.runCommand({addshard:"127.0.0.1:8081",allowLocal:true})
      db.runCommand({addshard:"127.0.0.1:8082",allowLocal:true})
      切记之前不可使用任何数据库语句
    4.5 打开数据库分片功能,为数据库foobar打开分片功能
      use admin
      db.runCommand({enablesharding:"foobar"})
    4.6 对集合进行分片
      db.runCommand({shardcollection:"foobar.bar",key:{"_id":1}}) 使用key进行分片
    4.7 利用大数据进行测试(800000条数据)
      测试数据.js  80w条数据中一部分存在8081服务器一部分存在8082服务器中
  5,查看数据库对于分片服务器的配置存储
    在路由器端口 db.printShardingStatus()
  6,查看集群对于bar的自动分片机制配置信息
    use config
    db.shards.find()
    查看配置库 db.mongos.find()
  7,保险起见的配置服务器集群
    一台路由器对应多台配置服务器和分成多个片区
  8,分片和副本集一起使用

------------------
# 第九讲: Java驱动
  驱动下载
    http://mongodb.github.io/mongo-java-driver/?_ga=1.99415006.1118467858.1470661701











