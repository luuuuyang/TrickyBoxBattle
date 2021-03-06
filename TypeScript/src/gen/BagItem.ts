import { ObjectBase, UIBase } from "core/interface"
import { ObjectManager, UIManager } from "core/manager"
import { InstantiateAsync } from "core/resource"
import { System, TextureReplacer, TSProperties, UnityEngine } from "csharp"
import { EffectDefines, EffectIndex } from "Datas/Effects"
import { $promise, $typeof } from "puerts"
import { CanClick } from "System/ClickController"
import { GetCurrentTurn, TurnBaseState } from "System/TurnBaseSystem"
import { GameObject, Vector3 } from "Utils/Components"
import { FadeTo, FlyTo, JumpOut } from "utils/SimpleAnimation"
import { T } from "utils/Utils"
import { HUD, Side } from "./HUD"
import { Item, ItemType } from "./Item"


export class BagItem extends Item {
	constructor(gameObject: GameObject) {
		super(gameObject)
	}
	
	OnStart(): void {
		
	}
	OnDestroy(): void {
		
	}

	CopyItem(item: Item, callBack: System.Action) {
		this.side = item.side
		this.type = ItemType.Immediate
		let effect = item.effect
		this.effect = effect
		this.effectName = item.effectName
		item.effect = null
		if (effect!=null){
			effect.transform.SetParent(this.gameObject.transform)
			effect.transform.localPosition = Vector3.zero
			effect.SetActive(false)
		}
		
		if (effect!=null) {
			effect.transform.localScale = Vector3.one
		}
		this.SetTexture(EffectIndex.get(this.effectName)!)
		this.SetListener(() => {
			if(this.isOpen){
				return
			}
			if(GetCurrentTurn()==TurnBaseState.NONE){
				return
			}
			if(this.side==Side.Left){
				if(GetCurrentTurn()!=TurnBaseState.Left){
					return
				}
			}
			if(this.side==Side.Right){
				if(GetCurrentTurn()!=TurnBaseState.Right){
					return
				}
			}
			if(!CanClick()){
				return
			}
			if(EffectDefines[this.effectName]!=undefined){
				let effect = EffectDefines[this.effectName]()
				
				if(this.side!=null && this.hud != null){
					effect.Init({
						hud: this.hud,
						side: this.side,
						effectObj: this.effect!,
						itemObj: this.gameObject
					},()=>{
						FadeTo(this.gameObject,0,0,()=>{})
						effect.Excute(()=>{
							ObjectManager.Destroy(this)
							callBack()
						})
						
					})
				}
			}else{
				console.error("No this effect "+this.effectName)
			}
		})
	}
}