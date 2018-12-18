'use strict';
game.import('character',function(lib,game,ui,get,ai,_status){
	return {
		name:'phantasmagoria',
		connect:true,
		character:{
			lilyblack:['female','5',3,['chunmian','bamiao']],
                  medicine:['female','1',3,['zaidu','zhanfang','huayuan']],
                  yuuka:['female','1',4,['zanghua','xiaofeng']],
                  komachi:['female','3',4,[]],
                  eiki:['female','1',4,[]],
		},
		characterIntro:{
			letty:'',
		},       
		perfectPair:{
		},
            skill:{
                chunmian:{
                      audio:2,
                      trigger:{player:'phaseBegin'},
                      filter:function(event,player){
                          return player.lili <= player.hp;
                      },
                      check:function(event,player){
                          return true;
                      },
                      content:function(){
                          "step 0"
                          event.current=player;
                          event.players=game.filterPlayer();
                          player.line(event.players,'black');
                          "step 1"
                          event.current.chooseTarget([1,1],true,get.prompt('chunmian'),function(card,player,target){
                              if(player==target) return false;
                              if(get.distance(player,target)<=1) return true;
                              if(game.hasPlayer(function(current){
                                  return current!=player&&get.distance(player,current)<get.distance(player,target);
                              })){
                              return false;
                          }
                              return target.countCards('hej');
                          }).set('ai',function(target){
                              return -get.attitude(_status.event.player,target);
                          }); 
                          "step 2"
                          if(result.bool){
                              event.current.line(result.targets,'black');
                              event.targets=result.targets;
                              event.current.discardPlayerCard(event.targets[0],'hej',[1,1],true);
                              event.targets[0].storage.chunmian = 1;
                          }
                          if(event.current.next!=player){
                              event.current=event.current.next;
                              game.delay(0.5);
                              event.goto(1);
                          }
                          "step 3"
                          var players = game.filterPlayer();
                          for (var i = 0; i < players.length; i ++){
                              if (players[i].storage.chunmian){
                                    players[i].draw();
                                    players[i].storage.chunmian = 0;
                              }
                          }
                      },
                  },
                  bamiao:{
                      audio:2,
                      enable:'phaseUse',
                      usable:2,
                      filter:function(event,player){
                          return !(player.lili == player.maxlili && player.num('hej') == 0);
                      },
                      content:function(){
                          var choice = [];
                          if (player.num('hej') != 0){
                              choice.push('lose_card');
                          }
                          if (player.lili != player.maxlili){
                              choice.push('gain_card');
                          }
                          'step 0'
                          player.chooseControl(choice).set('ai',function(){
                              if (player.lili < 5){
                                  return 'gain_card'; 
                              } else {
                                  return 'lose_card';
                              }
                              return 'gain_lili';
                          });
                          'step 1'
                          if (result.control == 'gain_card'){
                              player.gainlili();
                              player.draw();
                          } else if (result.control == 'lose_card') {
                              player.chooseToDiscard(1,true,'hej');
                              player.loselili();
                          }
                      },
                      ai:{
                          order:8,
                          result:{
                              player:function(player,target){
                                  return 1;
                              }
                          }
                      }
                  },
                  zaidu:{
                        group:['zaidu2'],
                        audio:2,
                        trigger:{player:'phaseEnd'},
                        content:function(){
                           'step 0'
                           var prompt;
                           if (player.storage.zaidu == 'heal') prompt = '令一名灵力不大于你的角色回复1点体力';
                           if (player.storage.zaidu == 'damage') prompt = '令一名灵力不大于你的角色受到1点弹幕伤害';
                           player.chooseTarget(get.prompt('zaidu'),function(card,player,target){
                              return target.lili <= player.lili;
                              }).set('ai',function(target){
                                    return 0;
                              });
                              "step 1"
                              if(result.bool){
                                    if (!player.storage.zaidu) result.targets[0].damage('thunder');
                                    else if (player.storage.zaidu == 'heal') result.targets[0].recover();
                                    else if (player.storage.zaidu == 'damage') result.targets[0].damage();
                              }   
                        },
                        intro:{
                              content:function(storage){
                                    if (!storage) return null;
                                    if (storage == 'heal') return '【灾毒】：回复1点体力';
                                    if (storage == 'damage') return '【灾毒】：造成1点弹幕伤害';
                              }
                        },
                  },
                  zaidu2:{
                        audio:2,
                        forced:true,
                        trigger:{player:['damageEnd','recoverAfter']},
                        filter:function(event,player){
                              if (event.name == 'damage') return event.nature != 'thunder';
                              return true;
                        },   
                        content:function(){
                              player.gainlili();
                        },
                  },
                  zhanfang:{
                        skillAnimation:true,
                        audio:2,
                        unique:true,
                        priority:-10,
                        trigger:{player:'phaseBeginStart'},
                        forced:true,
                        filter:function(event,player){
                              return player.lili == player.maxlili;
                        },
                        content:function(){
                              "step 0"
                              player.awakenSkill('zhanfang');
                              if (player.hp == player.maxHp) player.storage.zaidu == 'damage';
                              else player.storage.zaidu == 'heal';
                              player.markSkill('zaidu');
                              player.syncStorage('zaidu');
                              player.gainMaxHp();
                              player.useSkill('huayuan');
                              player.removeSkill('zhanfang');
                              player.update();
                        }
                  },
                  huayuan:{
                        audio:2,
                        spell:['huayuan_1'],
                        trigger:{player:['phaseBegin']},
                        roundi:function(event,player){
                              return player.isMaxHp(true);
                        },
                        filter:function(event,player){
                              return player.lili > lib.skill.huayuan.cost;
                        },
                        content:function(){
                              player.loselili(lib.skill.huayuan.cost);
                              player.turnOver();
                        },
                  },
                  zanghua_boom:{
                  },
            	zanghua:{
            		audio:2,
            		enable:'phaseUse',
            		filter:function(event, player){
            			return player.getCards('h') && !player.hasSkill('zanghua_boom');
            		},
            		filterTarget:function(card,player,target){
						return player!=target&&target.countCards('h')>0;
					},
            		content:function(){
            			"step 0"
					player.chooseToCompare(target);
					"step 1"
					if (!result.tie){
                                    if(result.bool){
      						if (player.canUse('juedou',target)) player.useCard({name:'juedou'},target);
      					} else {
      						if (target.canUse('juedou',player)) target.useCard({name:'juedou'},player);
                                    }
                              } else {
                                    player.addTempSkill('zanghua_boom');
                              }
                              "step 2"
                              if (target.hp < player.hp) player.addTempSkill('zanghua_boom');
            		},
            	},
            	xiaofeng:{
                        audio:2,
                        cost:4,
                        spell:['xiaofeng1,xiaofeng2'],
                        trigger:{player:['phaseBegin']},
                        filter:function(event,player){
                          if (player.hp == 1) return player.lili > (lib.skill.xiaofeng.cost - 2)
                          return player.lili > lib.skill.xiaofeng.cost;
                        },
                        content:function(){
                          if (player.hp == 1) player.loselili(lib.skill.xiaofeng.cost - 2);
                          else player.loselili(lib.skill.xiaofeng.cost);
                          player.turnOver();
                          player.useCard({name:'huazhi'},player);
                        },
            	},
                  xiaofeng1:{
                        forced:true,
                        trigger:{source:'damageBefore'},
                        content:function(){
                              trigger.num++;
                        }
                  },
                  xiaofeng2:{
                        mod:{
                              attackFrom:function(){
                                    return -Infinity;
                              },
                              number:function(card,number){
                                    return 12;
                              }
                        },
                  },
            },
            translate:{
                  lilyblack:'莉莉黑',
                  chunmian:'春眠',
                  chunmian_info:'准备阶段，若你的灵力值不大于体力值，你可以令所有角色各弃置与其最近的一名角色一张牌；然后，所有以此法失去牌的角色各摸一张牌。',
                  bamiao:'拔苗',
                  bamiao_info:'一回合两次，出牌阶段，你可以：获得1点灵力，然后摸一张牌；或消耗1点灵力，然后弃置一张牌。',
                  medicine:'梅蒂欣',
                  zaidu:'灾毒',
                  zaidu_info:'结束阶段，你可以指定一名灵力不大于你的角色，令其受到１点灵击伤害；你造成弹幕伤害后，或回复体力后，你获得１点灵力。',
                  zhanfang:'绽放',
                  zhanfang_info:'觉醒技，准备阶段，若你的灵力等于上限：若你未受伤，将【灾毒】中的“受到１点灵击伤害”改为“受到１点弹幕伤害”；否则，改为“回复１点体力”；然后，你增加１点体力上限，并发动【毒气花园】（需要消耗）。',
            	huayuan:'毒气花园',
                  huayuan_info:'符卡技（2）<u>若你体力为场上最高（或之一），符卡视为持有【永续】。</u>一回合一次，一名角色回复体力时，你可以：防止之，或令其额外回复１点；一名角色的体力值变动后，若为０，或为上限，你摸一张牌。',
                  yuuka:'幽香',
            	zanghua:'葬花',
                  zanghua_audio1:'花儿们好像对你很感兴趣呢。',
                  zanghua_audio2:'呵呵。',
            	zanghua_info:'出牌阶段，你可以与一名其他角色拼点；赢的角色视为对输的角色使用了一张【决斗】；若平局，或其体力值小于你，此技能无效，直到结束阶段。',
            	xiaofeng:'啸风弄月',
                  xiaofeng_audio1:'幻想「花鸟风月，啸风弄月」。',
                  xiaofeng_audio2:'那么，你死后的灵魂会长出什么花来呢？',
            	xiaofeng_info:'符卡技（4）<u>若你的体力为1，符卡消耗-2。</u>准备阶段，你视为使用一张【花之祝福】；你的攻击范围无限；你造成伤害时，令该伤害+1；你的牌点数均视为Q。',
            	yuuka_die:'嗯，我承认你还是挺强的呢。',
            },
      };
});