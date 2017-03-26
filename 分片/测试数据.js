function add(){
 var i = 0;
 for(;i<200000;i++){
   db.bar.insert({"age":i+10,"name":"jim"})
 }
}

function add2(){
 var i = 0;
 for(;i<200000;i++){
   db.bar.insert({"age":12,"name":"tom"+i})
 }
}

function add3(){
 var i = 0;
 for(;i<200000;i++){
   db.bar.insert({"age":12,"name":"lili"+i})
 }
}

//�鿴״̬
db.printShardingStatus()