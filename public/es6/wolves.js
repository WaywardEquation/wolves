/*global paper Point Raster Matrix view*/
/*eslint-env jquery, paper.js */
'use strict';

let startPopulation = 10;
let startFood = 10;
let foodSpawnPerTurn = 1; // per turn

let wolfStartHealth = 1000;
let wolfMaxSpeed = 3;
let wolfStartSize = 10;

let food;
let wolves;

function dist(a,b) {
   return Math.abs(a.icon.position.x - b.icon.position.x) + Math.abs(a.icon.position.y - b.icon.position.y);
}

class Food {
   constructor() {

      this.icon = new Raster('rabbit.gif',Math.floor(Math.random()*document.getElementById('mainCanvas').scrollWidth),
      Math.floor(Math.random()*document.getElementById('mainCanvas').scrollHeight));
      this.icon.fillColor = 'black';
   }
}
let wolfId = 0;
class Wolf {
   constructor() {
      this.id = wolfId++;
      this.lastDirection = -1;
      this.health = wolfStartHealth;
      let x =  Math.floor(Math.random()*document.getElementById('mainCanvas').scrollWidth);
      let y =  Math.floor(Math.random()*document.getElementById('mainCanvas').scrollHeight);
      this.icon = new Raster('wolf',x,y);
   }
   getMoveDist() {
      return wolfMaxSpeed * (1 - (this.health / wolfStartHealth));
   }
   moveTowardFood(closestFood) {
      let vector = new Point(closestFood.icon.position.x - this.icon.position.x,
                                   closestFood.icon.position.y - this.icon.position.y);
      let xMove =Math.abs(vector.x) * this.getMoveDist() / (Math.abs(vector.y) + Math.abs(vector.x));

      let direction = 1;
      if (vector.x < 0) {
         direction = -1;
         xMove *= -1;
      }
      if (this.lastDirection != direction) {
         this.icon.transform(new Matrix(-1,0,0,1,this.icon.position.x*2,0));
      }
      this.lastDirection = direction;

      xMove = Math.abs(vector.x) - Math.abs(xMove) > 0 ? xMove : vector.x;
      let yMove = this.getMoveDist() - Math.abs(xMove);
      yMove =  (vector.y < 0) ? yMove *= -1 : yMove;
      yMove = Math.abs(vector.y) - Math.abs(yMove) > 0 ? yMove : vector.y;
      let that = this;
      let target = new Point(that.icon.position.x+xMove,that.icon.position.y+yMove);
      this.icon.position.x = target.x;
      this.icon.position.y = target.y;
      if (this.near(closestFood.icon.position)) {
         this.eatFood(closestFood);
      }
      this.health--;
      this.icon.radius = wolfStartSize *  (this.health/ wolfStartHealth);
      if (that.health == 0) {
         that.icon.rotate(180);
         wolves = wolves.filter(w => w.id !== that.id);
         setTimeout(() => that.icon.remove(),500);
      }

   }
   runTurn() {

      let that = this;
      if (food.length < 1) {
         return;
      }
      let closestFood = food.reduce((ret,a) =>
         dist(a,that) < dist(ret,that)? a : ret
      );
      this.moveTowardFood(closestFood);

   }
   near(point) {
      return ((Math.abs(this.icon.position.x - point.x) < 1) &&
         (Math.abs(this.icon.position.y - point.y) < 1));
   }
   eatFood(closestFood) {
      food = food.filter(e => (! this.near(e.icon.position)));
      closestFood.icon.remove();
      this.health = wolfStartHealth;
      this.icon.radius = wolfStartSize;
   }
}

function spawn(num,ctor) {
   let a = [];
   for (let i=0;i<num;i++) {
      a.push(new ctor());
   }
   return a;
}

let i=0;
function runTurn() {

   'use strict';

   wolfStartHealth = $('#wolfStartHealth').val();
   startPopulation =$('#startPopulation').val();
   startFood = $('#startFood').val();
   foodSpawnPerTurn = $('#foodSpawnPerTurn').val(); // per turn
   wolfMaxSpeed = $('#wolfMaxSpeed').val();

   paper.install(window);
   paper.setup(document.getElementById('mainCanvas'));
   paper.view.draw();

   food = spawn(startFood,Food);
   wolves = spawn(startPopulation,Wolf);
   // let special = wolves[5];
   // special.getMoveDist = () => 10;
   // special.icon.fillColor = 'blue';
   view.onFrame = function(event) {
      if (i++%2 !== 0) {
         return;
      }
      if(i===2) {
         i=0;
      }
      for (let i=0;i<wolves.length;i++) {
         wolves[i].runTurn();
      }
      if (Math.random() < (.05 * foodSpawnPerTurn)) {
         spawn(1,Food).map(e => food.push(e));
      }
      $('#numWolves').text(wolves.length);
      $('#numFood').text(food.length);
   };
   paper.view.draw();
}
