import Convo from "./Convo"

export function incrementChampion(arkona, town) {
    if(arkona.gameState["CIRCUIT_SCORE"] == null) {
        arkona.gameState["CIRCUIT_SCORE"] = {}
    }
    arkona.gameState["CIRCUIT_SCORE"][town] = true
}

function _isChampion(arkona) {
    return arkona.gameState["CIRCUIT_SCORE"] != null &&
        Object.keys(arkona.gameState["CIRCUIT_SCORE"]).length == 5
}

export const AM_I_CHAMPION = Convo.condition((arkona) => _isChampion(arkona),
    new Convo("Indeed thou art valiant. Thou art ready to receive thy reward...")
        .answer("Great! I can't wait to enter the Raighd!"),
    new Convo("Thy reputation is great indeed. However, thou should travel to the other Circuit cities and prove " +
        "thy worth to the mayor before entry to the Raighd is granted.")
        .answer("I will do that!")
        .answer("What are the Cities of the Circuit?",
            new Convo("There are five cities in the Circuit: Voln to the north-west, the desert town of Haaga, " +
                "Breghan on the isle in the East, Mxxyr in the south-east and the fastness of Varholm.")
                .answer("I will continue on my quest")
                .answer("Thanks for the info, goodbye")
        )
    )

export const GENERAL_ARKONA = new Convo("The land of Arkona is a world on the brink of destruction. " +
    "Cities like Voln guard against the expansion of the Raighd.")
    .answer("What is the Raighd?",
        new Convo("Hast thou not heard of the demonic forests of the Raighd? Our town is one of five that " +
            "stops its chaos from running wild over all of Arkona!", "R_COMMON_RAIGHD")
            .answer("An evil forest?...",
                new Convo("Dost thou know nothing? The Raighd is the bane of our time! It's a vast stretch of untamed land, infested with evil. " +
                    "Demons walk freely in its jungles of corruption.")
                    .answer("Can one visit this place?", "R_VISIT_RAIGHD")
            )
    )
    .answer("How many cities are in Arkona?",
        new Convo("Wouldst thou hear of cities in the east or the west?", "R_GENERAL_CITIES")
            .answer("Tell me of the cities in the east",
                new Convo("The east side of Arkona is home to the cities Voln in the north and the fastness of Varhom to south.")
                    .answer("Tell me about the city Voln",
                        new Convo("Voln is one of the oldest cities in Arkona. It was the first city to establish the Circuit around the Raighd.")
                            .answer("Tell me about the circuit",
                                new Convo("After the last time demonic forces of the Raighd attacked, human cities created a magical barrier around it. " +
                                    "Together these cities are called the Circuit.", "R_GENERAL_CIRCUIT")
                                    .answer("What are the cities of the Circuit?", "R_GENERAL_CITIES")
                                    .answer("How does one enter the Raighd?",
                                        new Convo("Thou should stay out of the Raighd for it is a place of death and disease. However, if thou cannot be dissuaded, " +
                                            "thou need prove thy worth to each city of the Circuit.", "R_VISIT_RAIGHD")
                                            .answer("What is the Circuit, again?", "R_GENERAL_CIRCUIT")
                                            .answer("I'm not serious... tell me about the other cities", "R_GENERAL_CITIES")
                                            .answer("I must enter the Raighd",
                                                new Convo("Very well. In each town thou must perform a heroic deed. " +
                                                    "If all the towns agree about thy bravery, the barrier is lifted and thou can proceed to the Raighd.")
                                                    .answer("Thanks for the info!")
                                                    .answer("What are these towns, again?", "R_GENERAL_CITIES")
                                            )
                                    )
                            )
                            .answer("What is the Raighd?", "R_COMMON_RAIGHD")
                            .answer("Interesting, tell about the other cities", "R_GENERAL_CITIES")
                    )
                    .answer("Tell me about Varholm",
                        new Convo("Varholm island is surrounded entirely by mountains. " +
                        "It is said no one enters without the approval of their chieftain!")
                            .answer("Interesting, tell about the other cities", "R_GENERAL_CITIES")
                            .answer("Thanks for the info")
                    )
            )
            .answer("Tell me of the cities in the west",
                new Convo("The west side of Arkona has three cities: the desert town of Haaga to the north, Breghan near the center and Mxxyr to the south-west.")
                    .answer("Tell me about Haaga")
                    .answer("Any news of Breghan?")
                    .answer("What do you know about Mxxyr?")
            )
    )