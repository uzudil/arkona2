import Convo from "./Convo.js"

export const COMMON = new Convo("Thou art brave to intrude here. Leave now whilst thou still can!")
    .answer("Good idea, I'll be leaving now.")
    .answer("Are humans not welcome here?",
        new Convo("Aye, our kind has long suffered from war by thy people. But our fortress at Thornperil, in the shadow " +
            "of the Raighd gives us strength!")
        .answer("How is the Raighd helping you?",
            new Convo("Humans can't fight on two fronts. While they're busy fending off the Raighd, it is an opportunity " +
                "for us to thrive uncontested. Our new life stars here in this fort!", "URGIL_OPPORTUNITY")
                .answer("I wish you well in this endeavour, goodbye.")
                .answer("Is there anything I can do to help you?",
                    new Convo("If thou wishes to help goblinkind live in peace, thou should offer thy services to our king Urgil. " +
                        "Thou can find him in the main building.")
                        .answer("I will look him up!")
                        .answer("Tell me about the Raighd", "URGIL_RAIGHD")
                )
        )
        .answer("What is the Raighd?",
            new Convo("The Raighd is a fell place of death and darkness. It lies over the mountains to the north of here. " +
                "Goblins fear the Raighd just like thy kind but we use its presence to start a new life here.", "URGIL_RAIGHD")
                .answer("How are you using the Raighd?", "URGIL_OPPORTUNITY")
                .answer("Thanks for the info, goodbye.")
        )
    )

export const UGRIL = new Convo("Finally a human comes to acknowledge my reign as rightful ruler of goblinkind, south of the Raighd. " +
    "Kneel before me, messenger of humanity.")
    .answer("I think you're mistaking me for someone else, I'm only a traveler",
        new Convo("Be welcome in our halls then, traveler. Let it be known throughout the land that " +
            "king Urgil or Thornperil is generous in his hospitality!", "", (arkona) => arkona.gameState["URGIL_PEACE"] = true)
            .answer("I thank you king Urgil, goodbye.")
    )
    .answer("I kneel to you great king Urgil. Show me how I can be of help",
        new Convo("We aim to dwell here peacefully while our human foe is distracted by facing the Raighd. " +
            "All I ask of thee is to spread the word of our benevolent intent. Will thou do this?")
            .answer("Yes, I see the greatness of goblinkind, king Urgil",
                new Convo("Thou art an exemplary human, traveler. Thou hath my royal gratitude!", "", (arkona) => arkona.gameState["URGIL_PEACE"] = true)
                    .answer("Goodbye.")
            )
            .answer("I'm sorry but saying goblins are peaceful would be a lie.")
    )
