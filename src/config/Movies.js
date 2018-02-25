import {MONSTERS} from "./Monsters"

export const MOVIES = {
    "ritual": [
        {
            scene: (arkona) => arkona.narrate("The sensation of the cave becoming larger fills you with dread." +
                "Not sure if it's the weird symbols, the blood or the smells but something feels off." +
                "In the eerie silence the acolytes move closer and begin to chant."),
            endCondition: (arkona) => !arkona.messages.group.visible
        },
        {
            scene: (arkona) => {
                arkona.player.findPathTo(904, 2060, 0)
                arkona.getNpcByName("Grandmaster Zaren").findPathTo(905, 2053, 0)
                arkona.getNpcByName("Acolyte Hanem").findPathTo(911, 2053, 0)
                arkona.getNpcByName("Acolyte Mohk").findPathTo(913, 2060, 0)
            },
            endCondition: (arkona) =>
                arkona.player.path == null &&
                arkona.getNpcByName("Grandmaster Zaren").path == null &&
                arkona.getNpcByName("Acolyte Hanem").path == null &&
                arkona.getNpcByName("Acolyte Mohk").path == null
        },
        {
            scene: (arkona) => {
                arkona.narrate("All hail Mgguarthan, spirit of the Raighd!" +
                    "Lord Mgguarthan, join us!" +
                    "Lord Mgguarthan, come to us!" +
                    "We bask in your... Something is not right!" +
                    "Thy presence has disrupted the ritual, traveler!" +
                    "We are great dan... Noo! She is coming!")
                arkona.npcPaused = true
            },
            endCondition: (arkona) => !arkona.messages.group.visible
        },
        {
            scene: (arkona) => {
                let npc = arkona.addMonster(MONSTERS.demon, 908, 2058, 0)
                arkona.fx.run("fire", npc.animatedSprite.sprite)
                arkona.movieContext["npc"] = npc
                arkona.setCheckpoint()
            },
            endCondition: (arkona) => Date.now() - arkona.checkpoint > 500
        },
        {
            scene: (arkona) => {
                arkona.fx.run("fire", arkona.movieContext["npc"].animatedSprite.sprite)
                arkona.setCheckpoint()
            },
            endCondition: (arkona) => Date.now() - arkona.checkpoint > 500
        },
        {
            scene: (arkona) => {
                arkona.fx.run("fire", arkona.movieContext["npc"].animatedSprite.sprite)
                arkona.setCheckpoint()
            },
            endCondition: (arkona) => Date.now() - arkona.checkpoint > 500
        },
        {
            scene: (arkona) => {
                arkona.narrate("WHO DARES SUMMON MGGUARTHAN?" +
                    "WHERE IS THE SCENT OF ROTTING?" +
                    "WHOSO SPAKE THE ILLUMIS?" +
                    "THOU WILT ALL PAY IN SUFFERING!")
            },
            endCondition: (arkona) => !arkona.messages.group.visible
        },
        {
            scene: (arkona) => {
                arkona.gameState["mezalka_dead"] = true
                arkona.npcPaused = false
            },
            endCondition: (arkona) => !arkona.messages.group.visible
        },
    ]
}
