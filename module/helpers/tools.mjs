export function rollCheck(actor, targets) {
  if (!actor) {
    ui.notifications.warn("Select an actor.");
    return
  }
  new Dialog({
    title: 'Roll With Modifier',
    content: `
      <form class="flexcol">
        <div class="form-group">
          <select id="score">
            <option value="str">Strength</option>
            <option value="agi">Agility</option>
            <option value="sen">Sense</option>
            <option value="int">Intellect</option>
            <option value="will">Will</option>
            <option value="acc">Accuracy</option>
            <option value="knife">Accuracy (Knife)</option>
            <option value="sword">Accuracy (Sword)</option>
            <option value="lance">Accuracy (Lance)</option>
            <option value="axe">Accuracy (Axe)</option>
            <option value="blunt">Accuracy (Blunt)</option>
            <option value="whip">Accuracy (Whip)</option>
            <option value="bow">Accuracy (Bow)</option>
            <option value="hand">Accuracy (Hand)</option>
            <option value="katana">Accuracy (Katana)</option>
            <option value="gun">Accuracy (Gun)</option>
            <option value="magic">Accuracy (Magic)</option>
            <option value="eva">Evasion</option>
            <option value="dodge">Dodge</option>
            <option value="parry">Parry</option>
            <option value="shield">Shield</option>
            <option value="mov">Movement</option>
            <option value="res">Resistance</option>
          </select>
          <input id="modifier" type="number" value="0" />
        </div>
      </form>
    `,
    buttons: {
      yes: {
        icon: '<i class="fas fa-dice-d6"></i>',
        label: 'Roll',
        callback: async (html) => {
          let score = html.find('#score')
          let scorevalue = score.val();
          let goal = actor.getRollData()[scorevalue];
          let modifier = html.find('#modifier').val();
          let localizedname = game.i18n.localize(CONFIG.statStrings[scorevalue]);
          let finalflavor = `[${localizedname}]`
          
          if (targets.length == 1) {
            finalflavor = `[${localizedname}] vs. ${targets[0].name}`;
          } else if (targets.length > 1) {
            finalflavor = `[${localizedname}] vs. ${targets.map(e => e.name).join(", ")}`;
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

  var rd = actor.data.data.defense;

  const values = [
	{"name": game.i18n.localize("FWO.DefBash"), "value": rd["bash"].value},
	{"name": game.i18n.localize("FWO.DefSlash"), "value": rd["slash"].value},
	{"name": game.i18n.localize("FWO.DefStab"), "value": rd["stab"].value},
	{"name": game.i18n.localize("FWO.DefFire"), "value": rd["fire"].value},
	{"name": game.i18n.localize("FWO.DefCold"), "value": rd["cold"].value},
	{"name": game.i18n.localize("FWO.DefShock"), "value": rd["shock"].value},
	{"name": game.i18n.localize("FWO.DefIgnore"), "value": 0}
  ];
  const total = 0;

  let content = `<form><label>Damage</label><input type="number" name="resultDamage" data-result="damage" /><br/>`
  for(let r of values) {
    content += `<label>${r.name}</label><input type="checkbox" name="resultPick" data-type-name="${r.name}" data-result="${r.value}" /><br/>`;
  }
  content += "</div></form>";

  new Dialog({
    title: 'Calculate Damage against Defenses',
    content: content,
    buttons: [{
      label: 'Calculate',
      callback: (html) => {
	    if (targets.length == 0) {
          let pickedChoices = html.find("input[name='resultPick']:checked");
          let damageBase = html.find("input[name='resultDamage']")[0].value;
          let damageNames = Array.from(pickedChoices).map(e => e.dataset.typeName).join("/")

		  // Setting the value this way lets us handle typeless damage easily.
          let worst = Math.max(rd["bash"].value, rd["slash"].value, rd["stab"].value, rd["fire"].value, rd["cold"].value, rd["shock"].value);
          
          for (let i of pickedChoices) {
            worst = Math.min(worst, i.dataset.result);
          }
        
          let final = Math.max(damageBase - worst, 0);

          let chatText = {
            content: `${actor.name} took ${final} ${damageNames} damage.`
          };

          ChatMessage.create(chatText)
        } else {
          let pickedChoices = html.find("input[name='resultPick']:checked");
          let damageBase = html.find("input[name='resultDamage']")[0].value;
          let damageNames = Array.from(pickedChoices).map(e => e.dataset.typeName).join("/")
          
          let chatText = {
            content: `${actor.name} deals ${damageBase} ${damageNames} damage.`
          };
          
          chatText.content += "<ul>"

          for (let i of targets) {
		    // Setting the value this way lets us handle typeless damage easily.
            let worst = Math.max(rd["bash"].value, rd["slash"].value, rd["stab"].value, rd["fire"].value, rd["cold"].value, rd["shock"].value);
          
            for (let j of pickedChoices) {
              worst = Math.min(worst, j.dataset.result);
            }
        
            let final = Math.max(damageBase - worst, 0);

            chatText.content += `<li>${i.name} took ${final} damage.</li>`
          }
          
          chatText.content += "</ul>"

          ChatMessage.create(chatText)
        }
      }
    }]
  }).render(true);
}