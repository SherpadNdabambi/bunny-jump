import Phaser from '../lib/phaser.js'

import Carrot from '../game/Carrot.js'

export default class Game extends Phaser.Scene
{
   /** @type {Phaser.Physics.Arcade.Group} */
   carrots

   /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
   cursors

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

      // load the carrot image
      this.load.image('carrot', 'assets/carrot.png')

      // create cursor keys
      this.cursors = this.input.keyboard.createCursorKeys()
   }

   create()
   {
      // create background
      this.add.image(240, 320, 'background').setScrollFactor(1, 0)

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

      // add player-platfrom collision
      this.physics.add.collider(this.platforms, this.player)

      // disable other collisions
      this.player.body.checkCollision.up = false
      this.player.body.checkCollision.left = false
      this.player.body.checkCollision.right = false

      // follow rabbit
      this.cameras.main.startFollow(this.player)

      // set the horizontal dead zone to 1.5x game width
      this.cameras.main.setDeadzone(this.scale.width * 1.5)

      // create carrot group
      this.carrots = this.physics.add.group({
         classType: Carrot
      })

      // add carrot-platform collision
      this.physics.add.collider(this.platforms, this.carrots)

      // add player-carrot overlap
      this.physics.add.overlap(
         this.player,
         this.carrots,
         this.handleCollectCarrot,  // called on overlap
         undefined,
         this
      )
   }

   update(t, dt)
   {
      this.platforms.children.iterate(child => {
         /** @type {Phaser.Physics.Arcade.Sprite} */
         const platform = child

         const scrollY = this.cameras.main.scrollY
         if (platform.y >= scrollY + 700)
         {
            platform.y = scrollY - Phaser.Math.Between(50, 100)
            platform.body.updateFromGameObject()

            // create a carrot above the platform being reused
            this.addCarrotAbove(platform)
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

      // left and right input logic
      if (this.cursors.left.isDown && !touchingDown)
      {
         this.player.setVelocityX(-200)
      }
      else if (this.cursors.right.isDown && !touchingDown)
      {
         this.player.setVelocityX(200)
      }
      else
      {
         // stop movement if not left or right
         this.player.setVelocityX(0)
      }

      // wrap player around
      this.horizontalWrap(this.player)
   }

   // add player wrap-around logic
   /**
    * @param {Phaser.GameObjects.Sprite} sprite
    */
   horizontalWrap(sprite)
   {
      const halfWidth = sprite.displayWidth * 0.5
      const gameWidth = this.scale.width
      if (sprite.x < -halfWidth)
      {
         sprite.x = gameWidth + halfWidth
      }
      else if (sprite.x > gameWidth + halfWidth)
      {
         sprite.x = -halfWidth   
      }
   }

   /**
    * @param {Phaser.GameObjects.Sprite} sprite
    */
   addCarrotAbove(sprite)
   {
      const y = sprite.y - sprite.displayHeight

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const carrot = this.carrots.get(sprite.x, y, 'carrot')

      this.add.existing(carrot)

      // update the physics body size
      carrot.body.setSize(carrot.width, carrot.height)

      return carrot
   }

   /**
    * @param {Phaser.Physics.Arcade.Sprite} player
    * @param {Carrot} carrot
    */
   handleCollectCarrot(player, carrot)
   {
      // hide from display
      this.carrots.killAndHide(carrot)

      // disable from physics world
      this.physics.world.disableBody(carrot.body)
   }
 }