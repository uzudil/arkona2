import Convo from "./Convo"

export const ACOLYTE = new Convo("What art thou doing here down here? I will summon the guard at once!")
    .answer("I uh... just visiting?")

export const GUARD = new Convo("Move along citizen.")
    .answer("Could you tell me where I am?", "R_VARHOLM")

export const NOBLE = new Convo("Thy uncouth smell offends me. Away from me beggar else I call for the guards!")
    .answer("Could you tell me where I am?", "R_VARHOLM")
    .answer("Why you pompous cretin...")

export const KING = new Convo("Ah a citizen comes before me. What is it you wish of your ruler, pawn?")
    .answer("Could you tell me where I am?", "R_VARHOLM")

export const COMMON = new Convo("Welcome to Varholm island. Thou hath arrived on island paradise in the heart of Arkona.")
    .answer("Tell me about Varholm",
        new Convo("Why thou art in Varholm, the sunniest, best isle in all of Arkona. Ours is a unique democracy, lead by Chief Mezalka. " +
            "Thanks to the island's strong economy we prosper and spend our days in joyful labor.", "R_VARHOLM")
    )
    .answer("Who is in charge here?",
        new Convo("", "R_VARHOLM_RULER")
    )

