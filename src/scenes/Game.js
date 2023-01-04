import Phaser from '../lib/phaser.js'

export default class Game extends Phaser.Scene
{
   /** @type {Phaser.Physics.Arcade.StaticGroup} */
   platforms

   /** @type {Phaser.Physics.Arcade.Sprite} */
   player

   constructor()
   {
      super('game')
   }

   preload()
   {
      // load the backgound image
      this.load.image('background', 'assets/bg_layer1.png')

      // load the platform image
      this.load.image('platform', 'assets/ground_grass.png')

      // load the standing bunny image
      this.load.image('bunny-stand', 'assets/bunny1_stand.png')
   }

   create()
   {
      // create background
      this.add.image(240, 320, 'background')

      // create the platform group
      this.platforms = this.physics.add.staticGroup()

      // then create 5 platforms from the group
      for (let i = 0; i < 5; ++i)
      {
         const x = Phaser.Math.Between(80, 400)
         const y = 150 * i

         /** @type {Phaser.Physics.Arcade.Sprite} */
         const platform = this.platforms.create(x, y, 'platform')
         platform.scale = 0.5

         /** @type {Phaser.Physics.Arcade.StaticBody} */
         const body = platform.body
         body.updateFromGameObject()
      }

      // create a bunny sprite
      this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5)

      // add collision
      this.physics.add.collider(this.platforms, this.player)

      // disable other collisions
      this.player.body.checkCollision.up = false
      this.player.body.checkCollision.left = false
      this.player.body.checkCollision.right = false

      // follow rabbit
      this.cameras.main.startFollow(this.player)
   }

   update()
   {
      this.platforms.children.iterate(child => {
         /** @type {Phaser.Physics.Arcade.Sprite} */
         const platform = child

         const scrollY = this.cameras.main.scrollY
         if (platform.y >= scrollY + 700)
         {
            platform.y = scrollY - Phaser.Math.Between(50, 100)
            platform.body.updateFromGameObject()
         }
      })

      // find out from Arcade Physics if the player's physics body
      // is touching something below it
      const touchingDown = this.player.body.touching.down

      if (touchingDown)
      {
         // this makes the bunny jump straight up
         this.player.setVelocityY(-300)
      }
   }
 }