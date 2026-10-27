# Single source of truth for all cancer classes.
# Both the backend and ML layer import from here.

# Keras DirectoryIterator assigns class indices alphabetically by folder name.
# This order must match the model's 26 output neurons.
MODEL_CLASS_LABELS = [
    "all_benign",
    "all_early",
    "all_pre",
    "all_pro",
    "brain_glioma",
    "brain_menin",
    "brain_tumor",
    "breast_benign",
    "breast_malignant",
    "cervix_dyk",
    "cervix_koc",
    "cervix_mep",
    "cervix_pab",
    "cervix_sfi",
    "colon_aca",
    "colon_bnt",
    "kidney_normal",
    "kidney_tumor",
    "lung_aca",
    "lung_bnt",
    "lung_scc",
    "lymph_cll",
    "lymph_fl",
    "lymph_mcl",
    "oral_normal",
    "oral_scc",
]

MODEL_CLASS_DETAILS: dict[str, tuple[str, str]] = {
    "oral_normal": ("Oral Cancer", "Normal"),
    "oral_scc": ("Oral Cancer", "Oral Squamous Cell Carcinoma"),
    "all_pre": ("Leukemia", "Pre-B Lymphoblastic Leukemia"),
    "all_pro": ("Leukemia", "Pro-B Lymphoblastic Leukemia"),
    "brain_glioma": ("Brain Tumor", "Glioma"),
    "brain_menin": ("Brain Tumor", "Meningioma"),
    "brain_tumor": ("Brain Tumor", "Pituitary Tumor"),
    "breast_benign": ("Breast Cancer", "Benign"),
    "all_benign": ("Leukemia", "Benign"),
    "all_early": ("Leukemia", "Early Pre-B Lymphoblastic Leukemia"),
    "cervix_dyk": ("Cervical Cancer", "Dyskeratotic"),
    "breast_malignant": ("Breast Cancer", "Malignant"),
    "cervix_koc": ("Cervical Cancer", "Koilocytotic"),
    "cervix_mep": ("Cervical Cancer", "Metaplastic"),
    "kidney_normal": ("Kidney Cancer", "Normal"),
    "kidney_tumor": ("Kidney Cancer", "Renal Cell Carcinoma"),
    "cervix_pab": ("Cervical Cancer", "Parabasal"),
    "cervix_sfi": ("Cervical Cancer", "Superficial-Intermediate"),
    "colon_bnt": ("Colon & Lung Cancer", "Colon Benign Tissue"),
    "colon_aca": ("Colon & Lung Cancer", "Colon Adenocarcinoma"),
    "lung_aca": ("Colon & Lung Cancer", "Lung Adenocarcinoma"),
    "lung_bnt": ("Colon & Lung Cancer", "Lung Benign Tissue"),
    "lymph_cll": ("Leukemia", "Chronic Lymphocytic Leukemia"),
    "lung_scc": ("Colon & Lung Cancer", "Lung Squamous Cell Carcinoma"),
    "lymph_mcl": ("Leukemia", "Mantle Cell Lymphoma"),
    "lymph_fl": ("Leukemia", "Follicular Lymphoma"),
}

# Flat list in the exact order used by the model output neurons.
ALL_CLASSES: list[tuple[str, str]] = [MODEL_CLASS_DETAILS[label] for label in MODEL_CLASS_LABELS]

CANCER_CLASSES: dict[str, list[str]] = {}
for group, subtype in ALL_CLASSES:
    CANCER_CLASSES.setdefault(group, []).append(subtype)

CANCER_GROUPS = list(CANCER_CLASSES.keys())


def get_class_by_index(index: int) -> tuple[str, str]:
    """Return (cancer_group, cancer_subtype) for a flat index."""
    return ALL_CLASSES[index % len(ALL_CLASSES)]


def get_group_subtypes(group: str) -> list[str]:
    return CANCER_CLASSES.get(group, [])
