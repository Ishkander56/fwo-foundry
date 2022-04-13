export function rollCheck(actor) {
  if (!actor) {
    ui.notifications.warn("Select an actor.");
    return
  }
  new Dialog({
    title: 'Roll With Modifier',
    content: `
      <form class="flexcol">
        <div class="form-group">
          <select id="target">
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
    //select element type
    buttons: {
      yes: {
        icon: '<i class="fas fa-dice-d6"></i>',
        label: 'Roll',
        callback: async (html) => {
          let target = html.find('#target')
          let targetvalue = target.val();
          let targetnumber = actor.getRollData()[targetvalue];
          let modifier = html.find('#modifier').val();
                      
          let roll = new Roll(`3d6ms<(${targetnumber}+${modifier})`);
          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: targetvalue
          });
        },
      },
    }
  }).render(true);
}

export function calculateDamage(actor) {
  if (!actor) {
    ui.notifications.warn("Select an actor.");
    return
  }

  var rd = actor.data.data.defense;

  const values = [
	{"name": "{{localize 'FWO.DefBash'}}", "value": rd["bash"].value},
	{"name": "{{localize 'FWO.DefSlash'}}", "value": rd["slash"].value},
	{"name": "{{localize 'FWO.DefStab'}}", "value": rd["stab"].value},
	{"name": "{{localize 'FWO.DefFire'}}", "value": rd["fire"].value},
	{"name": "{{localize 'FWO.DefCold'}}", "value": rd["cold"].value},
	{"name": "{{localize 'FWO.DefShock'}}", "value": rd["shock"].value},
	{"name": "{{localize 'FWO.DefIgnore'}}", "value": 0}
  ];
  const total = 0;

  let content = `<form><label>Damage</label><input type="number" name="resultDamage" data-result="damage" /><br/>`
  for(let r of values) {
    content += `<label>${r.name}</label><input type="checkbox" name="resultPick" data-result="${r.value}" /><br/>`;
  }
  content += "</div></form>";

  new Dialog({
    title: 'Calculate Damage against Defenses',
    content: content,
    buttons: [{
      label: 'Calculate',
      callback: (html) => {
        let pickedChoices = html.find("input[name='resultPick']:checked");
        let damageBase = html.find("input[name='resultDamage']")[0].value;

		// Setting the value this way lets us handle typeless damage easily.
        let worst = Math.max(rd["bash"].value, rd["slash"].value, rd["stab"].value, rd["fire"].value, rd["cold"].value, rd["shock"].value);

        let damageNames = []
          
        for (let i of pickedChoices) {
          worst = Math.min(worst, i.dataset.result);
        }
        
        let final = Math.max(damageBase - worst, 0);

        let chatData = {
          content: `${actor.data.name} took ${final} damage.`
        };

        ChatMessage.create(chatData)
      }
    }]
  }).render(true);
}