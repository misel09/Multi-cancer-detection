# Single source of truth for all cancer classes.
# Both the backend and ML layer import from here.

# 8 cancer groups with their subtypes
CANCER_CLASSES = {
    "Brain Tumor": [
        "Glioma",
        "Meningioma",
        "Pituitary Tumor",
        "No Tumor",
    ],
    "Breast Cancer": [
        "Benign",
        "Malignant",
        "Normal",
    ],
    "Cervical Cancer": [
        "Dyskeratotic",
        "Koilocytotic",
        "Metaplastic",
        "Parabasal",
        "Superficial-Intermediate",
    ],
    "Colon & Lung Cancer": [
        "Colon Adenocarcinoma",
        "Colon Benign Tissue",
        "Lung Adenocarcinoma",
        "Lung Benign Tissue",
        "Lung Squamous Cell Carcinoma",
    ],
    "Kidney Cancer": [
        "Clear Cell Renal Cell Carcinoma",
        "Chromophobe Renal Cell Carcinoma",
        "Normal",
    ],
    "Leukemia": [
        "Benign",
        "Early Pre-B Lymphoblastic Leukemia",
        "Pre-B Lymphoblastic Leukemia",
        "Pro-B Lymphoblastic Leukemia",
    ],
    "Oral Cancer": [
        "Normal",
        "Oral Squamous Cell Carcinoma",
    ],
    "Skin Cancer": [
        "Actinic Keratosis",
        "Basal Cell Carcinoma",
        "Dermatofibroma",
        "Melanoma",
        "Nevus",
        "Seborrheic Keratosis",
        "Squamous Cell Carcinoma",
        "Vascular Lesion",
    ],
}

# Flat list of all (group, subtype) tuples — used for index mapping
ALL_CLASSES: list[tuple[str, str]] = [
    (group, subtype)
    for group, subtypes in CANCER_CLASSES.items()
    for subtype in subtypes
]

CANCER_GROUPS = list(CANCER_CLASSES.keys())


def get_class_by_index(index: int) -> tuple[str, str]:
    """Return (cancer_group, cancer_subtype) for a flat index."""
    return ALL_CLASSES[index % len(ALL_CLASSES)]


def get_group_subtypes(group: str) -> list[str]:
    return CANCER_CLASSES.get(group, [])
