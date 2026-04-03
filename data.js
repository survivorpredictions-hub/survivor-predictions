const allCastaways = [
  "Colby Donaldson",
  "Kyle Fraser",
  "Q Burdette",
  "Rizo Velovic",
  "Angelina Keeley",
  "Aubry Bracco",
  "Genevieve Mushaluk",
  "Stephenie LaGrossa",
  "Christian Hubicki",
  "Joe Hunter",
  "Ozzy Lusth",
  "Rick Devens",
  "Cirie Fields",
  "Emily Flippen",
  "Jenna Lewis",
  "Savannah Louie",
  "Mike White",
  "Tiffany Nicole Ervin",
  "Charlie Davis",
  "Jonathan Young",
  "Benjamin Wade",
  "Dee Valladares",
  "Kamilla Karthigesu",
  "Chrissy Hofbeck"
];

const players = [
  {
    name: "Wilhite, Amy",
    picks: ["Stephenie LaGrossa", "Emily Flippen", "Joe Hunter"],
    winnerPick: "Joe Hunter"
  },
  {
    name: "Wilkinson, Bob",
    picks: ["Aubry Bracco", "Dee Valladares", "Rizo Velovic"],
    winnerPick: "Aubry Bracco"
  },
  {
    name: "Wilkinson, Glenna",
    picks: ["Emily Flippen", "Christian Hubicki", "Jonathan Young"],
    winnerPick: "Jonathan Young"
  },
  {
    name: "Wilkinson, Jeff",
    picks: ["Rick Devens", "Tiffany Nicole Ervin", "Dee Valladares"],
    winnerPick: "Tiffany Nicole Ervin"
  },
  {
    name: "Wilkinson, Kim",
    picks: ["Aubry Bracco", "Tiffany Nicole Ervin", "Benjamin Wade"],
    winnerPick: "Aubry Bracco"
  },
  {
    name: "Zorich, Chris",
    picks: ["Stephenie LaGrossa", "Rick Devens", "Christian Hubicki"],
    winnerPick: "Rick Devens"
  },
  {
    name: "Edson, George",
    picks: ["Stephenie LaGrossa", "Colby Donaldson", "Rick Devens"],
    winnerPick: "Colby Donaldson"
  },
  {
    name: "Edson, Jill",
    picks: ["Tiffany Nicole Ervin", "Kamilla Karthigesu", "Benjamin Wade"],
    winnerPick: "Tiffany Nicole Ervin"
  },
  {
    name: "Jones, Emily",
    picks: ["Stephenie LaGrossa", "Joe Hunter", "Kamilla Karthigesu"],
    winnerPick: "Kamilla Karthigesu"
  },
  {
    name: "Jones, Oliver",
    picks: ["Kamilla Karthigesu", "Jonathan Young", "Aubry Bracco"],
    winnerPick: "Jonathan Young"
  },
  {
    name: "Kight, Grace",
    picks: ["Dee Valladares", "Kamilla Karthigesu", "Jonathan Young"],
    winnerPick: "Jonathan Young"
  },
  {
    name: "Wilhite, Cody",
    picks: ["Genevieve Mushaluk", "Rick Devens", "Christian Hubicki"],
    winnerPick: "Genevieve Mushaluk"
  },
  {
    name: "Wilkinson, Kate",
    picks: ["Rizo Velovic", "Genevieve Mushaluk", "Rick Devens"],
    winnerPick: "Genevieve Mushaluk"
  },
  {
    name: "Zorich, Avery",
    picks: ["Colby Donaldson", "Stephenie LaGrossa", "Joe Hunter"],
    winnerPick: "Joe Hunter"
  },
  {
    name: "Zorich, Courtney",
    picks: ["Rick Devens", "Tiffany Nicole Ervin", "Colby Donaldson"],
    winnerPick: "Rick Devens"
  },
  {
    name: "Zorich, Laura",
    picks: ["Colby Donaldson", "Dee Valladares", "Stephenie LaGrossa"],
    winnerPick: "Colby Donaldson"
  },
  {
    name: "Wilhite, Emma",
    picks: ["Genevieve Mushaluk", "Stephenie LaGrossa", "Colby Donaldson"],
    winnerPick: "Genevieve Mushaluk"
  },
  {
    name: "Wilkinson, Jim",
    picks: ["Genevieve Mushaluk", "Rick Devens", "Kamilla Karthigesu"],
    winnerPick: "Rick Devens"
  },
  {
    name: "Zorich, Kelsey",
    picks: ["Genevieve Mushaluk", "Emily Flippen", "Colby Donaldson"],
    winnerPick: "Genevieve Mushaluk"
  },
  {
    name: "Wilkinson, Nixon",
    picks: ["Genevieve Mushaluk", "Kamilla Karthigesu", "Colby Donaldson"],
    winnerPick: "Colby Donaldson"
  }
];

let updateMessage = "Updates from Week 6: Standings have been updated every Thursday or Friday. Good luck!";

let eliminatedByWeek = [
  {
    week: 1,
    players: ["Jenna Lewis", "Kyle Fraser"]
  },
  {
    week: 2,
    players: ["Savannah Louie"]
  },
  {
    week: 3,
    players: ["Q Burdette"]
  },
  {
    week: 4,
    players: ["Mike White"]
  },
  {
    week: 5,
    players: ["Angelina Keeley", "Charlie Davis"]
  },
  {
    week: 6,
    players: ["Genevieve Mushaluk", "Colby Donaldson", "Kamilla Karthigesu"]
  }
];