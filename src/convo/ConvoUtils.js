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
                "Breghan on the isle in the East, Mxxyr in the south-east and the fastness of Wessyn.")
                .answer("I will continue on my quest")
                .answer("Thanks for the info, goodbye")
        )
    )
