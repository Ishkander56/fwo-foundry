/**
* Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
* @extends {Actor}
*/
export class FilledWithActor extends Actor {

	/** @override */
	prepareData() {
		// Prepare data for the actor. Calling the super version of this executes
		// the following, in order: data reset (to clear active effects),
		// prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
		// prepareDerivedData().
		super.prepareData();
	}

	/** @override */
	prepareBaseData() {
		// Data modifications in this step occur before processing embedded
		// documents or derived data.
	}
	
	_prepareCharacterData(actorData) {
		if (actorData.type !== 'character') return;
		
		this._calculateCL(actorData)
		this._calculateAbilityScores(actorData)
		this._calculateDerivedScores(actorData)
		this._calculateDefenses(actorData)
		this._calculateFortune(actorData)
	}
	
	_prepareNpcData(actorData) {
		if (actorData.type !== 'enemy') return;
		
		this._calculateCL(actorData)
		this._calculateAbilityScores(actorData)
		this._calculateDerivedScores(actorData)
		this._calculateDefenses(actorData)
	}

	/**
	* @override
	* Augment the basic actor data with additional dynamic data. Typically,
	* you'll want to handle most of your calculated/derived data in this step.
	* Data calculated in this step should generally not exist in template.json
	* (such as ability modifiers rather than ability scores) and should be
	* available both inside and outside of character sheets (such as if an actor
	* is queried and has a roll executed directly from it).
	*/
	prepareDerivedData() {
		const actorData = this.data;
		const data = actorData.data;
		const flags = actorData.flags.fwo || {};

		// Make separate methods for each Actor type (character, npc, etc.) to keep
		// things organized.
		this._prepareCharacterData(actorData);
		this._prepareNpcData(actorData);
	}
	
	_calculateCL(actorData) {
		const data = actorData.data;
		
		if (this.data.type == 'character')	{
			const cl1 = data.class.main.level ?? 0;
			const cl2 = data.class.sub.level ?? 0;
			const cl3 = data.class.master.level ?? 0;
		
			data.class.total = cl1 + cl2 + cl3;
		} else if (data.class.main) {
			data.class.total = data.class.main.level ?? 0;
		} else {
			data.class.total = 0;
		}
	}

	_calculateAbilityScores(actorData) {
		const data = actorData.data

		for (let [key, ability] of Object.entries(data.ability)) {
			ability.value = (ability.base + ability.bonus + ability.trait + ability.item + ability.misc + ability.temp)
		}
	}
	
	_calculateDerivedScores(actorData) {
		const data = actorData.data

		data.derived.hp.base = (data.class.total * 4) + data.ability.str.value + (data.ability.will.value * 2)
		data.derived.fp.base = (data.class.total * 2) + data.ability.str.value
		data.derived.acc.base = data.ability.agi.value
		data.derived.eva.base = data.ability.sen.value
		data.derived.mov.base = data.ability.agi.value - 5
		data.derived.init.base = data.ability.sen.value
		data.derived.res.base = data.ability.will.value
		
		for (let [key, derived] of Object.entries(data.derived)) {
			if (key == "hp") {
				derived.max = (derived.base + derived.skill + derived.trait + derived.item + derived.misc + derived.temp)
				derived.min = derived.max * -1
			} else if (key == "fp") {
				derived.max = (derived.base + derived.skill + derived.trait + derived.item + derived.misc + derived.temp)
				derived.min = 0
			} else if (key == "knife" || key == "sword" || key == "lance" || key == "axe" || key == "blunt" || key == "whip" || key == "bow" || key == "hand" || key == "katana" || key == "gun" || key == "magic") {
				derived.base = data.derived.acc.value
				derived.value = (derived.base + derived.skill + derived.trait + derived.item + derived.misc + derived.temp)
			} else if (key == "dodge" || key == "parry" || key == "shield") {
				derived.base = data.derived.eva.value
				derived.value = (derived.base + derived.skill + derived.trait + derived.item + derived.misc + derived.temp)
			} else {
				derived.value = (derived.base + derived.skill + derived.trait + derived.item + derived.misc + derived.temp)
			}
		}
	}
		
	_calculateFortune(actorData) {
		const data = actorData.data

		data.fortune.base = 1 + Math.min(Math.floor(data.class.total / 5), 9)
		data.fortune.max = (data.fortune.base + data.fortune.skill + data.fortune.trait + data.fortune.item + data.fortune.misc + data.fortune.temp)
	}
	
	_calculateDefenses(actorData) {
		const data = actorData.data

		for (let [key, defense] of Object.entries(data.defense)) {
			defense.value = (defense.armor + defense.skill +  defense.trait + defense.item + defense.misc + defense.temp)
		}
	}

	/**
	* Override getRollData() that's supplied to rolls.
	*/
	getRollData() {
		const data = super.getRollData();

		// Prepare character roll data.
		this._getCharacterRollData(data);
		this._getNpcRollData(data);

		return data;
	}

	/**
	* Prepare character roll data.
	*/
	_getCharacterRollData(data) {
		if (this.data.type !== 'character') return;
		
		if (data.class.total ?? 1 > 50) {data.cl = 50;}
		else {data.cl = data.class.total ?? 1;}
		
		data.str = data.ability.str.value ?? 10;
		data.agi = data.ability.agi.value ?? 10;
		data.sen = data.ability.sen.value ?? 10;
		data.int = data.ability.int.value ?? 10;
		data.will = data.ability.will.value ?? 10;
		
		data.acc = data.derived.acc.value ?? 0;
		data.knife = data.derived.knife.value ?? 0;
		data.sword = data.derived.sword.value ?? 0;
		data.lance = data.derived.lance.value ?? 0;
		data.axe = data.derived.axe.value ?? 0;
		data.blunt = data.derived.blunt.value ?? 0;
		data.whip = data.derived.whip.value ?? 0;
		data.bow = data.derived.bow.value ?? 0;
		data.hand = data.derived.hand.value ?? 0;
		data.katana = data.derived.katana.value ?? 0;
		data.gun = data.derived.gun.value ?? 0;
		data.magic = data.derived.magic.value ?? 0;
		
		data.eva = data.derived.eva.value ?? 0;
		data.dodge = data.derived.dodge.value ?? 0;
		data.parry = data.derived.parry.value ?? 0;
		data.shield = data.derived.shield.value ?? 0;
		
		data.mov = data.derived.mov.value ?? 0;
		data.res = data.derived.res.value ?? 0;
		data.init = data.derived.init.value ?? 0;
	}

	/**
	* Prepare NPC roll data.
	*/
	_getNpcRollData(data) {
		if (this.data.type !== 'enemy') return;

		data.cl = data.class.total ?? 1;
		
		data.str = data.ability.str.value ?? 10;
		data.agi = data.ability.agi.value ?? 10;
		data.sen = data.ability.sen.value ?? 10;
		data.int = data.ability.int.value ?? 10;
		data.will = data.ability.will.value ?? 10;
		
		var tempAcc = data.derived.acc.value ?? 0;
		
		data.acc = tempAcc;
		data.knife = tempAcc;
		data.sword = tempAcc;
		data.lance = tempAcc;
		data.axe = tempAcc;
		data.blunt = tempAcc;
		data.whip = tempAcc;
		data.bow = tempAcc;
		data.hand = tempAcc;
		data.katana = tempAcc;
		data.gun = tempAcc;
		data.magic = tempAcc;
		
		data.eva = data.derived.eva.value ?? 0;
		data.dodge = data.derived.dodge.value ?? 0;
		data.parry = data.derived.parry.value ?? 0;
		data.shield = data.derived.shield.value ?? 0;
		
		data.mov = data.derived.mov.value ?? 0;
		data.res = data.derived.res.value ?? 0;
		data.init = data.derived.init.value ?? 0;
	}

}
