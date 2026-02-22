# services/health_tips.py
import random

CULTURAL_TIPS = []
CULTURAL_TIPS.extend([
    {
        "category": "Health",
        "title": "Rest No Be Laziness",
        "content": "Body no be generator. If you tire, rest small. Sleep well-well at night. Hustle sweet, but if your health spoil, who go enjoy the money?",
        "icon": "moon"
    },
    {
        "category": "Diet",
        "title": "Don’t Fear Beans",
        "content": "Beans fit give breeze, but e build body well. Plenty protein dey inside. Just soak am before cooking so e soft and easy for stomach.",
        "icon": "bean"
    },
    {
        "category": "Mental Health",
        "title": "Talk Am Out",
        "content": "If something dey worry you, no lock am inside like old cupboard. Find person wey you trust talk am. Mind wey calm fit think better.",
        "icon": "message-circle"
    },
    {
        "category": "Environment",
        "title": "Plant Something",
        "content": "Even if na small pepper for bucket, plant something. Green things dey cool environment and give fresh food. Na small-small we dey build better tomorrow.",
        "icon": "sprout"
    },
    {
        "category": "Food Safety",
        "title": "Cover Your Food",
        "content": "Fly no dey knock before e land. Always cover your food. One small contamination fit cause big wahala for belle.",
        "icon": "shield"
    },
    {
        "category": "Hydration",
        "title": "Drink Water Before Thirst",
        "content": "No wait until your throat dry like harmattan. Drink water steady during the day. Your kidney go thank you quietly.",
        "icon": "glass-water"
    },
    {
        "category": "Lifestyle",
        "title": "Reduce Too Much Sugar",
        "content": "Soft drink sweet, but too much sugar dey stress body. Try take am easy. Water and fresh fruit na better long-term friend.",
        "icon": "cup-soda"
    },
    {
        "category": "Community",
        "title": "Check On Your Neighbour",
        "content": "Community na strength. Sometimes greet your neighbour, check if dem dey okay. Strong village spirit dey protect everybody.",
        "icon": "users"
    },
    {
        "category": "Hygiene",
        "title": "Sun-Dry Your Bedding",
        "content": "Once in a while, carry mattress or pillow go sun small. Sunlight dey kill some germs and remove smell. Nature get free disinfectant.",
        "icon": "sun"
    },
    {
        "category": "Nutrition",
        "title": "Eat Local Fruits",
        "content": "Pawpaw, orange, pineapple — no underrate them. Local fruits get plenty vitamins and dey cheaper than imported snacks.",
        "icon": "apple"
    }
])


def get_random_tip():
    return random.choice(CULTURAL_TIPS)

def get_tips_by_category(category):
    return [tip for tip in CULTURAL_TIPS if tip["category"].lower() == category.lower()]
