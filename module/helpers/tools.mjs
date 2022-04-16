export function rollCheck(actor, targets) {
  if (!actor) {
    ui.notifications.warn("Select an actor.");
    return
  }
  new Dialog({
    title: game.i18n.localize("FWO.QuickCheck"),
    content: `
      <form class="flexcol">
        <div class="form-group">
          <select id="score">
            <option value="str">${game.i18n.localize("FWO.StrLong")}</option>
            <option value="agi">${game.i18n.localize("FWO.AgiLong")}</option>
            <option value="sen">${game.i18n.localize("FWO.SenLong")}</option>
            <option value="int">${game.i18n.localize("FWO.IntLong")}</option>
            <option value="will">${game.i18n.localize("FWO.WillLong")}</option>
            <option value="acc">${game.i18n.localize("FWO.AccLong")}</option>
            <option value="knife">${game.i18n.localize("FWO.AccKnifeLong")}</option>
            <option value="sword">${game.i18n.localize("FWO.AccSwordLong")}</option>
            <option value="lance">${game.i18n.localize("FWO.AccLanceLong")}</option>
            <option value="axe">${game.i18n.localize("FWO.AccAxeLong")}</option>
            <option value="blunt">${game.i18n.localize("FWO.AccBluntLong")}</option>
            <option value="whip">${game.i18n.localize("FWO.AccWhipLong")}</option>
            <option value="bow">${game.i18n.localize("FWO.AccBowLong")}</option>
            <option value="hand">${game.i18n.localize("FWO.AccHandLong")}</option>
            <option value="katana">${game.i18n.localize("FWO.AccKatanaLong")}</option>
            <option value="gun">${game.i18n.localize("FWO.AccGunLong")}</option>
            <option value="magic">${game.i18n.localize("FWO.AccMagicLong")}</option>
            <option value="eva">${game.i18n.localize("FWO.EvaLong")}</option>
            <option value="dodge">${game.i18n.localize("FWO.EvaDodge")}</option>
            <option value="parry">${game.i18n.localize("FWO.EvaParry")}</option>
            <option value="shield">${game.i18n.localize("FWO.EvaShield")}</option>
            <option value="mov">${game.i18n.localize("FWO.MovLong")}</option>
            <option value="res">${game.i18n.localize("FWO.ResLong")}</option>
          </select>
          <input id="modifier" type="number" value="0" />
        </div>
      </form>
    `,
    buttons: {
      yes: {
        icon: '<i class="fas fa-dice-d6"></i>',
        label: game.i18n.localize("FWO.QuickCheck"),
        callback: async (html) => {
          let score = html.find('#score')
          let scorevalue = score.val();
          let goal = actor.getRollData()[scorevalue];
          let modifier = html.find('#modifier').val();
          let localizedname = game.i18n.localize(CONFIG.statStrings[scorevalue]);
          let finalflavor = `[${localizedname}]`
          
          if (targets.length >= 1) {
            finalflavor += game.i18n.format("FWO.QuickCheckTargets", {targets: (targets.map(e => e.name).join(game.i18n.localize("FWO.QuickCheckTargetsJoiner")))});
          }
                      
          postRollMessage(actor, finalflavor, goal, modifier);
        },
      },
    }
  }).render(true);
}

function postRollMessage(actor, flavor, goal, modifier) {
  let roll = new Roll(`3d6ms<(${goal}+${modifier})`);
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor: flavor
  });
}

export function calculateDamage(actor, targets) {
  if (!actor) {
    ui.notifications.warn("Select an actor.");
    return
  }

  const values = [
	{"label": game.i18n.localize("FWO.DefBash"), "type": "bash"},
	{"label": game.i18n.localize("FWO.DefSlash"), "type": "slash"},
	{"label": game.i18n.localize("FWO.DefStab"), "type": "stab"},
	{"label": game.i18n.localize("FWO.DefFire"), "type": "fire"},
	{"label": game.i18n.localize("FWO.DefCold"), "type": "cold"},
	{"label": game.i18n.localize("FWO.DefShock"), "type": "shock"},
	{"label": game.i18n.localize("FWO.DefIgnore"), "type": null}
  ];
  const total = 0;

  let content = `<form><label>${game.i18n.localize("FWO.QuickDamageTotal")}</label><input type="number" name="resultDamage" data-result="damage" /><br/>`
  for(let r of values) {
    content += `<label>${r.label}</label><input type="checkbox" name="resultPick" data-label="${r.label}" data-type="${r.type}" /><br/>`;
  }
  content += "</div></form>";

  new Dialog({
    title: game.i18n.localize("FWO.QuickDamage"),
    content: content,
    buttons: [{
      label: game.i18n.localize("FWO.QuickDamage"),
      callback: (html) => {
	    if (targets.length == 0) {
          let pickedChoices = html.find("input[name='resultPick']:checked");
          let damageBase = html.find("input[name='resultDamage']")[0].value;
          let damageNames = Array.from(pickedChoices).map(e => e.dataset.label).join(game.i18n.localize("FWO.QuickDamageTypesJoiner"))

		  // Setting the value this way lets us handle typeless damage easily.
		  let rd = actor.data.data.defense;
          let worst = Math.max(rd["bash"].value, rd["slash"].value, rd["stab"].value, rd["fire"].value, rd["cold"].value, rd["shock"].value);
          
          for (let i of pickedChoices) {
            worst = Math.min(worst, rd[i.dataset.type].value);
          }
        
          let damageFinal = Math.max(damageBase - worst, 0);

          let chatText = {
            content: game.i18n.format("FWO.QuickDamageTakenSelect", {name: actor.name, final: damageFinal, types: damageNames})
          };

          ChatMessage.create(chatText)
        } else {
          let pickedChoices = html.find("input[name='resultPick']:checked");
          let damageBase = html.find("input[name='resultDamage']")[0].value;
          let damageNames = Array.from(pickedChoices).map(e => e.dataset.label).join(game.i18n.localize("FWO.QuickDamageTypesJoiner"))
          
          let chatText = {
            content: game.i18n.format("FWO.QuickDamageDealt", {name: actor.name, base: damageBase, types: damageNames})
          };
          
          chatText.content += "<ul>"

          for (let i of targets) {
		    // Setting the value this way lets us handle typeless damage easily.
		    let rd = i.actor.data.data.defense
            let worst = Math.max(rd["bash"].value, rd["slash"].value, rd["stab"].value, rd["fire"].value, rd["cold"].value, rd["shock"].value);
          
            for (let j of pickedChoices) {
              worst = Math.min(worst, rd[j.dataset.type].value);
            }
        
            let damageFinal = Math.max(damageBase - worst, 0);

            chatText.content += `<li>${game.i18n.format("FWO.QuickDamageTakenList", {name: i.actor.name, final: damageFinal})}</li>`
          }
          
          chatText.content += "</ul>"

          ChatMessage.create(chatText)
        }
      }
    }]
  }).render(true);
}