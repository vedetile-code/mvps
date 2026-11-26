/* Official DVSA “show me, tell me” bank.
   Source: https://www.gov.uk/government/publications/car-show-me-tell-me-vehicle-safety-questions/car-show-me-tell-me-vehicle-safety-questions
   Updated 4 December 2017; retrieved 26 Nov 2026.
   Contains public sector information licensed under the Open Government Licence v3.0.
   https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
   TellMe Coach is not affiliated with or endorsed by DVSA. */
window.TELLME_BANK = {
  examName: "UK car driving test — show me, tell me",
  standardName: "DVSA car ‘show me, tell me’ vehicle safety questions",
  standardUrl: "https://www.gov.uk/government/publications/car-show-me-tell-me-vehicle-safety-questions/car-show-me-tell-me-vehicle-safety-questions",
  standardUpdated: "4 December 2017",
  retrieved: "26 November 2026",
  licence: "Open Government Licence v3.0",
  licenceUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  jurisdiction: "England, Scotland and Wales",
  questions: [
    {
      id: "TM01",
      area: "Tell me",
      task: "Brakes",
      type: "tell",
      question: "Tell me how you’d check that the brakes are working before starting a journey.",
      model_answer_points: [
        "Brakes should not feel spongy or slack.",
        "Brakes should be tested as you set off.",
        "The vehicle should not pull to one side."
      ],
      keywords: [
        ["spongy", "slack", "soft", "soggy"],
        ["set off", "setting off", "move off", "moving off", "as you start", "when you start", "pull away", "pulling away"],
        ["pull to one side", "pulls to one side", "pulling to one side", "veer", "drifting"]
      ],
      follow_up: "If the pedal felt spongy, or the car pulled to one side as you set off, what would that tell you?",
      follow_up_points: ["The brakes may not be working properly and should be checked before you continue."],
      follow_up_keywords: [["not working", "fault", "problem", "checked", "inspect", "repair", "don't drive", "do not drive", "get them checked"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q1 (updated 4 Dec 2017).",
      note: null
    },
    {
      id: "TM02",
      area: "Tell me",
      task: "Tyre pressures",
      type: "tell",
      question: "Tell me where you’d find the information for the recommended tyre pressures for this car and how tyre pressures should be checked.",
      model_answer_points: [
        "Use the manufacturer’s guide (handbook, door pillar or fuel-flap placard).",
        "Use a reliable pressure gauge.",
        "Check and adjust pressures when the tyres are cold.",
        "Don’t forget the spare tyre.",
        "Remember to refit the valve caps."
      ],
      keywords: [
        ["manufacturer", "handbook", "manual", "door pillar", "fuel flap", "fuel cap", "sticker", "placard", "maker's", "makers"],
        ["gauge", "tyre pressure", "air line", "forecourt"],
        ["cold"],
        ["spare"],
        ["valve cap", "valve caps"]
      ],
      follow_up: "Why should the pressures be checked when the tyres are cold?",
      follow_up_points: ["Pressure rises as tyres warm up, so a reading taken when they are hot can be misleading."],
      follow_up_keywords: [["warm", "hot", "heat", "rises", "increase", "misleading", "inaccurate", "higher"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q2 (updated 4 Dec 2017).",
      note: null
    },
    {
      id: "TM03",
      area: "Tell me",
      task: "Head restraint",
      type: "tell",
      question: "Tell me how you make sure your head restraint is correctly adjusted so it provides the best protection in the event of a crash.",
      model_answer_points: [
        "The rigid part of the head restraint should be at least as high as the eye or the top of the ears.",
        "It should be as close to the back of the head as is comfortable.",
        "Some restraints might not be adjustable."
      ],
      keywords: [
        ["eye", "ear", "ears", "top of the head", "level with"],
        ["close", "near", "as close"],
        ["not be adjustable", "not adjustable", "some", "fixed", "might not"]
      ],
      follow_up: "How close should the restraint sit to the back of your head?",
      follow_up_points: ["As close to the back of the head as is comfortable."],
      follow_up_keywords: [["close", "near", "comfortable"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q3 (updated 4 Dec 2017).",
      note: null
    },
    {
      id: "TM04",
      area: "Tell me",
      task: "Tyre condition and tread",
      type: "tell",
      question: "Tell me how you’d check the tyres to ensure that they have sufficient tread depth and that their general condition is safe to use on the road.",
      model_answer_points: [
        "No cuts and bulges.",
        "At least 1.6 mm of tread depth across the central three-quarters of the breadth of the tyre.",
        "That tread depth should go around the entire outer circumference of the tyre."
      ],
      keywords: [
        ["cut", "cuts", "bulge", "bulges", "damage", "gash"],
        ["1.6", "1.6mm", "1.6 mm", "one point six"],
        ["three-quarters", "three quarters", "3/4", "central", "centre three"],
        ["circumference", "all the way around", "around the tyre", "whole way round", "entire"]
      ],
      follow_up: "Across how much of the tyre’s breadth must that 1.6 mm of tread be present?",
      follow_up_points: ["Across the central three-quarters of the breadth of the tyre, and around the entire outer circumference."],
      follow_up_keywords: [["three-quarters", "three quarters", "3/4", "central"], ["circumference", "all the way around", "around", "entire"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q4 (updated 4 Dec 2017).",
      note: null
    },
    {
      id: "TM05",
      area: "Tell me",
      task: "Headlights and tail lights",
      type: "tell",
      question: "Tell me how you’d check that the headlights and tail lights are working. You don’t need to exit the vehicle.",
      model_answer_points: [
        "Operate the light switch, turning on the ignition if necessary.",
        "Then walk round the vehicle to look at the lights.",
        "Because this is a ‘tell me’ question, you do not need to physically check them during the answer."
      ],
      keywords: [
        ["switch", "ignition", "turn on", "turn them on", "operate"],
        ["walk round", "walk around", "walk around the vehicle", "get out and look", "go round"]
      ],
      follow_up: "Do you need to get out and check the lights while you answer this tell-me question?",
      follow_up_points: ["No. You explain that you would operate the switch and walk round; you don’t need to physically check them for this tell-me question."],
      follow_up_keywords: [["no", "don't need", "do not need", "explain", "tell me", "not physically"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q5 (updated 4 Dec 2017).",
      note: null
    },
    {
      id: "TM06",
      area: "Tell me",
      task: "Anti-lock braking system",
      type: "tell",
      question: "Tell me how you’d know if there was a problem with your anti-lock braking system.",
      model_answer_points: [
        "A warning light should illuminate if there is a fault with the anti-lock braking system."
      ],
      keywords: [
        ["warning light", "abs light", "warning lamp", "dashboard light", "illuminate", "comes on", "come on", "lights up"]
      ],
      follow_up: "Where would you expect to see that warning?",
      follow_up_points: ["On the dashboard or instrument cluster, as the ABS warning light."],
      follow_up_keywords: [["dash", "instrument", "cluster", "warning light", "abs"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q6 (updated 4 Dec 2017).",
      note: null
    },
    {
      id: "TM07",
      area: "Tell me",
      task: "Direction indicators",
      type: "tell",
      question: "Tell me how you’d check the direction indicators are working. You don’t need to exit the vehicle.",
      model_answer_points: [
        "Operate the indicator switch, turning on the ignition if necessary.",
        "Then walk round the vehicle."
      ],
      keywords: [
        ["switch", "stalk", "ignition", "operate", "turn on"],
        ["walk round", "walk around", "go round", "look around the car"]
      ],
      follow_up: "What else can help you notice a failed indicator while you drive?",
      follow_up_points: ["A faster tell-tale flash, or a warning, can indicate a failed bulb — confirm against the official list and your handbook."],
      follow_up_keywords: [["faster", "quick", "tell-tale", "tell tale", "warning", "bulb"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q7 (updated 4 Dec 2017).",
      note: "The official published answer is the switch and walk-round. A faster tell-tale is common advice from instructors; treat it as extra, not a substitute for the official points."
    },
    {
      id: "TM08",
      area: "Tell me",
      task: "Brake lights",
      type: "tell",
      question: "Tell me how you’d check the brake lights are working on this car.",
      model_answer_points: [
        "Operate the brake pedal.",
        "Make use of reflections in windows or doors, or ask someone to help."
      ],
      keywords: [
        ["brake pedal", "press the brake", "foot on the brake", "press the pedal"],
        ["reflection", "window", "door", "someone", "another person", "ask someone", "helper", "wall", "garage door"]
      ],
      follow_up: "If you were on your own, how could you still check them?",
      follow_up_points: ["Use reflections in a window, door or garage wall, or ask someone to help."],
      follow_up_keywords: [["reflection", "window", "door", "wall", "someone", "ask"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q8 (updated 4 Dec 2017).",
      note: null
    },
    {
      id: "TM09",
      area: "Tell me",
      task: "Power-assisted steering",
      type: "tell",
      question: "Tell me how you’d check the power-assisted steering is working before starting a journey.",
      model_answer_points: [
        "If the steering becomes heavy, the system may not be working properly.",
        "Gentle pressure on the steering wheel, maintained while the engine is started, should result in a slight but noticeable movement as the system begins to operate.",
        "Alternatively, turning the steering wheel just after moving off will give an immediate indication that the power assistance is functioning."
      ],
      keywords: [
        ["heavy", "heavier", "hard to turn", "stiff"],
        ["pressure", "start the engine", "while the engine", "as you start", "slight", "movement", "noticeable"],
        ["moving off", "move off", "just after", "pulling away", "set off"]
      ],
      follow_up: "Describe one of the two simple checks you can do before a journey.",
      follow_up_points: [
        "Keep gentle pressure on the wheel as you start the engine and feel for a slight movement, or turn the wheel just after moving off."
      ],
      follow_up_keywords: [["pressure", "start", "engine", "movement"], ["moving off", "move off", "just after", "turn the wheel"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q9 (updated 4 Dec 2017).",
      note: null
    },
    {
      id: "TM10",
      area: "Tell me",
      task: "Rear fog light",
      type: "tell",
      question: "Tell me how you’d switch on the rear fog light(s) and explain when you’d use it/them. You don’t need to exit the vehicle.",
      model_answer_points: [
        "Operate the switch, turning on dipped headlights and the ignition if necessary.",
        "Check that the warning light is on.",
        "Explain when you would use it."
      ],
      keywords: [
        ["switch", "dipped", "headlight", "ignition"],
        ["warning light", "warning lamp", "tell-tale", "tell tale", "comes on"],
        ["fog", "visibility", "seriously reduced", "100 metre", "100 meter", "100m", "poor visibility", "can't see", "cannot see"]
      ],
      follow_up: "When should rear fog lights be used?",
      follow_up_points: [
        "The official tell-me answer is ‘explain use’. The Highway Code says do not use rear fog lights unless visibility is seriously reduced, generally to less than 100 metres, and switch them off when visibility improves (rule 226)."
      ],
      follow_up_keywords: [["seriously reduced", "100", "fog", "poor visibility", "switch them off", "visibility improves"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q10 (updated 4 Dec 2017). Highway Code rule 226 is an additional official source for when to use rear fog lights.",
      note: "Use of rear fog lights is only summarised as ‘explain use’ on the official tell-me list. Highway Code rule 226 is cited separately for the follow-up."
    },
    {
      id: "TM11",
      area: "Tell me",
      task: "Main beam",
      type: "tell",
      question: "Tell me how you switch your headlight from dipped to main beam and explain how you’d know the main beam is on.",
      model_answer_points: [
        "Operate the switch, with the ignition or engine on if necessary.",
        "Check with the main beam warning light."
      ],
      keywords: [
        ["switch", "stalk", "pull", "push", "ignition", "engine"],
        ["warning light", "blue light", "blue warning", "tell-tale", "tell tale", "indicator light"]
      ],
      follow_up: "How do you know main beam is actually on?",
      follow_up_points: ["The main beam warning light (typically blue) will be on."],
      follow_up_keywords: [["warning light", "blue", "tell-tale", "tell tale", "dash"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q11 (updated 4 Dec 2017).",
      note: "The official answer says ‘main beam warning light’; it does not specify the colour. ‘Blue’ is common on UK cars and is treated as supporting detail, not a required official point."
    },
    {
      id: "TM12",
      area: "Tell me",
      task: "Engine oil",
      type: "tell",
      question: "Open the bonnet and tell me how you’d check that the engine has sufficient oil.",
      model_answer_points: [
        "Identify the dipstick or oil-level indicator.",
        "Describe checking the oil level against the minimum and maximum markers."
      ],
      keywords: [
        ["dipstick", "oil level", "indicator", "dip stick"],
        ["minimum", "maximum", "min", "max", "markers", "marks", "between", "level"]
      ],
      follow_up: "Would you check this with the engine running, and where are the marks you use?",
      follow_up_points: ["Identify the dipstick or indicator and read the level against the min and max markers. Follow the handbook for whether the engine should be off and on level ground."],
      follow_up_keywords: [["dipstick", "min", "max", "minimum", "maximum", "handbook", "off", "level ground"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q12 (updated 4 Dec 2017). The official list also notes you need to open the bonnet for questions 12, 13 or 14.",
      note: "On test you may be asked to open the bonnet and identify the item."
    },
    {
      id: "TM13",
      area: "Tell me",
      task: "Engine coolant",
      type: "tell",
      question: "Open the bonnet and tell me how you’d check that the engine has sufficient engine coolant.",
      model_answer_points: [
        "Identify the high and low level markings on the header tank where fitted, or the radiator filler cap.",
        "Describe how you would top up to the correct level."
      ],
      keywords: [
        ["header tank", "expansion tank", "reservoir", "radiator", "filler cap", "coolant tank"],
        ["high", "low", "min", "max", "minimum", "maximum", "marking", "marks"],
        ["top up", "top-up", "fill", "correct level"]
      ],
      follow_up: "What would you look for on the tank or cap?",
      follow_up_points: ["The high and low (or min and max) markings, or the radiator filler cap if there is no header tank, and then topping up to the correct level."],
      follow_up_keywords: [["high", "low", "min", "max", "header", "radiator", "cap"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q13 (updated 4 Dec 2017).",
      note: "Never advise opening a hot cooling system. If a candidate describes removing a cap from a hot radiator, the debrief should flag the safety point."
    },
    {
      id: "TM14",
      area: "Tell me",
      task: "Hydraulic brake fluid",
      type: "tell",
      question: "Open the bonnet and tell me how you’d check that you have a safe level of hydraulic brake fluid.",
      model_answer_points: [
        "Identify the reservoir.",
        "Check the level against the high and low markings."
      ],
      keywords: [
        ["reservoir", "brake fluid bottle", "brake fluid tank", "master cylinder"],
        ["high", "low", "min", "max", "minimum", "maximum", "marking", "marks", "level"]
      ],
      follow_up: "What markings are you comparing the level with?",
      follow_up_points: ["The high and low markings on the reservoir."],
      follow_up_keywords: [["high", "low", "min", "max", "mark"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Tell me Q14 (updated 4 Dec 2017).",
      note: "On test you may be asked to open the bonnet and identify the reservoir."
    },
    {
      id: "SM01",
      area: "Show me",
      task: "Rear windscreen wash and clean",
      type: "show",
      question: "When it’s safe to do so, can you show me how you wash and clean the rear windscreen?",
      model_answer_points: [
        "Wait until it is safe.",
        "Operate the rear washer and wiper control.",
        "Do not let the action distract you from the road."
      ],
      keywords: [
        ["safe", "safely", "when it's safe"],
        ["rear", "back window", "rear screen", "rear windscreen"],
        ["wash", "wiper", "wipe", "stalk", "control", "button"]
      ],
      follow_up: "Why does the examiner say ‘when it’s safe to do so’?",
      follow_up_points: ["Show-me questions are asked while you are driving. You only operate the control when it will not create a danger or a distraction."],
      follow_up_keywords: [["driving", "safe", "distract", "danger", "road"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Show me Q1 (updated 4 Dec 2017). The official page lists the request, not a model script.",
      note: "Official published answers are not given for show-me items. Practice points describe a safe method only. Confirm the exact control in the car you will use on test. Do not practise these actions on a moving car except with an instructor, or on test."
    },
    {
      id: "SM02",
      area: "Show me",
      task: "Front windscreen wash and clean",
      type: "show",
      question: "When it’s safe to do so, can you show me how you wash and clean the front windscreen?",
      model_answer_points: [
        "Wait until it is safe.",
        "Operate the front washer and wiper control.",
        "Do not let the action distract you from the road."
      ],
      keywords: [
        ["safe"],
        ["front", "windscreen", "windshield", "washer", "wiper"],
        ["stalk", "control", "pull", "button"]
      ],
      follow_up: "What do you do first if you are in a busy junction when you are asked?",
      follow_up_points: ["Wait until it is safe, then operate the control."],
      follow_up_keywords: [["wait", "safe", "later", "when safe"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Show me Q2 (updated 4 Dec 2017). The official page lists the request, not a model script.",
      note: "Official published answers are not given for show-me items. Confirm the control in the test car."
    },
    {
      id: "SM03",
      area: "Show me",
      task: "Dipped headlights",
      type: "show",
      question: "When it’s safe to do so, can you show me how you’d switch on your dipped headlights?",
      model_answer_points: [
        "Wait until it is safe.",
        "Switch on the dipped headlights using the lighting control.",
        "Check they are on, without staring away from the road."
      ],
      keywords: [
        ["safe"],
        ["dipped", "headlight", "headlights", "dipped beam"],
        ["switch", "stalk", "control"]
      ],
      follow_up: "How can you tell dipped headlights are on without looking down for long?",
      follow_up_points: ["A glance at the lighting tell-tale or the lighting switch position, then eyes back to the road."],
      follow_up_keywords: [["tell-tale", "tell tale", "warning", "glance", "switch", "dash"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Show me Q3 (updated 4 Dec 2017). The official page lists the request, not a model script.",
      note: "Official published answers are not given for show-me items."
    },
    {
      id: "SM04",
      area: "Show me",
      task: "Rear demister",
      type: "show",
      question: "When it’s safe to do so, can you show me how you’d set the rear demister?",
      model_answer_points: [
        "Wait until it is safe.",
        "Switch on the rear demister / rear screen heater.",
        "Avoid a long look down at the switch panel."
      ],
      keywords: [
        ["safe"],
        ["rear demister", "rear demist", "rear screen", "rear heater", "heated rear", "back window heat"],
        ["button", "switch", "control"]
      ],
      follow_up: "Why might an examiner ask for this during a test in clear weather?",
      follow_up_points: ["To see that you can find and use the control safely while driving, not because the screen must be misted."],
      follow_up_keywords: [["control", "safely", "find", "use", "while driving"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Show me Q4 (updated 4 Dec 2017). The official page lists the request, not a model script.",
      note: "Official published answers are not given for show-me items."
    },
    {
      id: "SM05",
      area: "Show me",
      task: "Horn",
      type: "show",
      question: "When it’s safe to do so, can you show me how you’d operate the horn?",
      model_answer_points: [
        "Wait until it is safe and legal.",
        "Operate the horn control (usually the centre of the steering wheel).",
        "A short, controlled press is enough to show you know the control."
      ],
      keywords: [
        ["safe", "legal"],
        ["horn", "steering wheel", "centre", "center", "pad", "button"],
        ["press", "tap", "sound"]
      ],
      follow_up: "When should you not sound the horn?",
      follow_up_points: ["The Highway Code restricts horn use: do not sound it at night in a built-up area (except to avoid danger) and do not use it to intimidate. Confirm the current rule before test."],
      follow_up_keywords: [["night", "built-up", "built up", "danger", "intimidate", "legal", "highway code"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Show me Q5 (updated 4 Dec 2017). Highway Code rules on horn use are a separate official source for the follow-up.",
      note: "Practise identifying the control. Do not blast the horn in a built-up area or at night except as the Highway Code allows."
    },
    {
      id: "SM06",
      area: "Show me",
      task: "Front demister",
      type: "show",
      question: "When it’s safe to do so, can you show me how you’d demist the front windscreen?",
      model_answer_points: [
        "Wait until it is safe.",
        "Set the front demist control or direct warm air to the windscreen, and use the heated front screen if fitted.",
        "Keep your attention on the road while you do it."
      ],
      keywords: [
        ["safe"],
        ["demist", "defrost", "windscreen", "front screen", "fan", "heat", "air to the screen", "heated windscreen"],
        ["control", "button", "dial", "switch"]
      ],
      follow_up: "What is the aim of the setting you choose?",
      follow_up_points: ["To clear mist or frost from the front windscreen so your view is not blocked."],
      follow_up_keywords: [["clear", "mist", "frost", "view", "see", "visibility"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Show me Q6 (updated 4 Dec 2017). The official page lists the request, not a model script.",
      note: "Official published answers are not given for show-me items. Controls vary by car."
    },
    {
      id: "SM07",
      area: "Show me",
      task: "Side window",
      type: "show",
      question: "When it’s safe to do so, can you show me how you’d open and close the side window?",
      model_answer_points: [
        "Wait until it is safe.",
        "Open the side window a short way using the switch or handle, then close it.",
        "Do not take both hands off the wheel or stare at the switch."
      ],
      keywords: [
        ["safe"],
        ["window", "side window", "electric window", "winder", "switch"],
        ["open", "close", "shut"]
      ],
      follow_up: "How much do you need to open it to show the control?",
      follow_up_points: ["A short, controlled opening and closing is enough. You do not need to open it fully."],
      follow_up_keywords: [["short", "little", "slightly", "not fully", "enough", "controlled"]],
      reference: "GOV.UK, Car ‘show me, tell me’ vehicle safety questions, Show me Q7 (updated 4 Dec 2017). The official page lists the request, not a model script.",
      note: "Official published answers are not given for show-me items."
    }
  ]
};
