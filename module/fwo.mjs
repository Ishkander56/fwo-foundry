// Import document classes.
import { FilledWithActor } from "./documents/actor.mjs";
import { FilledWithItem } from "./documents/item.mjs";
// Import sheet classes.
import { FilledWithActorSheet } from "./sheets/actor-sheet.mjs";
import { FilledWithItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import * as FilledWithTools from "./helpers/tools.mjs";
import { FWO } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.fwo = {
    FilledWithActor,
    FilledWithItem,
    rollItemMacro
  };
  
  let src = 'systems/fwo-foundry/img/fwo.webp'

  $('#logo').attr('src', src)
  $('#logo').attr('height', '10px')

  // Add custom constants for configuration.
  CONFIG.FWO = FWO;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@init + (@agi * 0.01) + (3d6 * 0.0001)",
    decimals: 4
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = FilledWithActor;
  CONFIG.Item.documentClass = FilledWithItem;
  
  // Change default cone angle. Padding of 5 degrees to make it a little easier to highlight the appropriate hexes.
  CONFIG.MeasuredTemplate.defaults.angle = 125;
  
  // Override default status effects.
  CONFIG.statusEffects = [
    {"id":"unbalanced","label":"FWO.StatusUnbalanced","icon":"icons/svg/daze.svg","changes":[{"key":"data.derived.eva.temp","value":-3,"mode":2}],"duration":{"turns":1}},
	{"id":"downed","label":"FWO.StatusDowned","icon":"icons/svg/falling.svg","changes":[{"key":"data.derived.acc.temp","value":-3,"mode":2},{"key":"data.derived.eva.temp","value":-3,"mode":2},{"key":"data.derived.mov.temp","value":-3,"mode":2}]},
	{"id":"darkness","label":"FWO.StatusDarkness","icon":"icons/svg/blind.svg"},
	{"id":"sleep","label":"FWO.StatusSleep","icon":"icons/svg/sleep.svg"},
	{"id":"paralysis","label":"FWO.StatusParalysis","icon":"icons/svg/paralysis.svg"},
	{"id":"sealed","label":"FWO.StatusSealed","icon":"icons/svg/silenced.svg"},
	{"id":"petrified","label":"FWO.StatusPetrified","icon":"icons/svg/statue.svg"},
	{"id":"frozen","label":"FWO.StatusFrozen","icon":"icons/svg/frozen.svg"},
	{"id":"stasis","label":"FWO.StatusStasis","icon":"icons/svg/padlock.svg"},
	{"id":"unconscious","label":"FWO.StatusUnconscious","icon":"icons/svg/unconscious.svg","changes":[{"key":"data.derived.hp.value","value":"0","mode":3}]}, //pass 0 as a string because 0 as an int doesn't work
	{"id":"dead","label":"FWO.StatusDead","icon":"icons/svg/skull.svg"},
	{"id":"heartburn","label":"FWO.StatusHeartburn","icon":"icons/svg/fire.svg"},
	{"id":"brand","label":"FWO.StatusBranded","icon":"icons/svg/target.svg"},
	{"id":"drown","label":"FWO.StatusDrowning","icon":"icons/svg/waterfall.svg"}
  ];
  
  CONFIG.statStrings = {
    "str": "FWO.Str",
    "agi": "FWO.Agi",
    "sen": "FWO.Sen",
    "int": "FWO.Int",
    "will": "FWO.Will",
    
    "hp": "FWO.HP",
    "fp": "FWO.FP",
    "acc": "FWO.Acc",
    "eva": "FWO.Eva",
    "mov": "FWO.Mov",
    "init": "FWO.Init",
    "res": "FWO.Res",
    "fortune": "FWO.Fortune",
    
    "bash": "FWO.DefBash",
    "slash": "FWO.DefSlash",
    "stab": "FWO.DefStab",
    "fire": "FWO.DefFire",
    "cold": "FWO.DefCold",
    "shock": "FWO.DefShock",
    
    "knife": "FWO.AccKnife",
    "sword": "FWO.AccSword",
    "lance": "FWO.AccLance",
    "axe": "FWO.AccAxe",
    "blunt": "FWO.AccBlunt",
    "whip": "FWO.AccWhip",
    "bow": "FWO.AccBow",
    "hand": "FWO.AccHand",
    "katana": "FWO.AccKatana",
    "gun": "FWO.AccGun",
    "magic": "FWO.AccMagic",
    
    "dodge": "FWO.EvaDodge",
    "shield": "FWO.EvaShield",
    "parry": "FWO.EvaParry"
  }
  
  //Roll.CHAT_TEMPLATE = "systems/fwo-foundry/templates/chat/roll.html";

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("fwo", FilledWithActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("fwo", FilledWithItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Control Buttons                             */
/* -------------------------------------------- */

Hooks.on('getSceneControlButtons', (buttons) => {
  if (!canvas) return;
  let group = buttons.find((b) => b.name === 'token');
  group.tools.push({
    button: true,
    icon: 'fas fa-dice',
    name: 'quickCheck',
    title: game.i18n.localize("FWO.QuickCheck"),
    onClick: () => {
      FilledWithTools.rollCheck(canvas.tokens.controlled[0].actor, Array.from(game.user.targets))
    },
  },{
    button: true,
    icon: 'fas fa-calculator',
    name: 'quickDamage',
    title: game.i18n.localize("FWO.QuickDamage"),
    onClick: () => {
      FilledWithTools.calculateDamage(canvas.tokens.controlled[0].actor, Array.from(game.user.targets))
    },
  });
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('greaterThan', function(x, y, options) {
  if (x > y){
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('notGreaterThan', function(x, y, options) {
  if (x > y){
    return options.inverse(this);
  }
  return options.fn(this);
});

Handlebars.registerHelper('lessThan', function(x, y, options) {
  if (x < y){
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('notLessThan', function(x, y, options) {
  if (x < y){
    return options.invetse(this);
  }
  return options.fn(this);
});

Handlebars.registerHelper('times', function(times, options) {
  var outStr = ''
  while (times--) {
    outStr += options.fn();
  }
  return outStr
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.fwo.rollItemMacro("${item.name}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "fwo.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}
