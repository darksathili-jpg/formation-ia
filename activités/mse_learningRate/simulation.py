import matplotlib
matplotlib.use('agg')
import matplotlib.pyplot as plt
from pyscript import document, display, when  # type: ignore
@when("click", "#runBtn")
def run_simulation(event):
    secret = int(document.getElementById("secretSlider").value)
    lr     = int(document.getElementById("lrSlider").value) / 100
    valeur = float(document.getElementById("startSlider").value)
    depart = valeur

    erreurs = []
    etapes_convergence = 30

    for i in range(30):
        err = (valeur - secret) ** 2
        erreurs.append(err)
        if err < 1 and etapes_convergence == 30:
            etapes_convergence = i + 1
        valeur = valeur - lr * (valeur - secret)

    fig, ax = plt.subplots(figsize=(7, 3))
    fig.patch.set_facecolor('#1a2a35')
    ax.set_facecolor('#1a2a35')

    couleurs = ['#ff6b6b'] + ['#ffc107'] * 29
    ax.plot(erreurs, color='#ffc107', linewidth=2.5)
    ax.scatter(range(len(erreurs)), erreurs, color=couleurs, s=30, zorder=5)

    ax.set_title(f"secret={secret}  |  lr={lr:.2f}  |  départ={int(depart)}",
                 color='white', fontsize=10)
    ax.set_xlabel("Étapes", color='#e0e0e0', fontsize=9)
    ax.set_ylabel("Erreur MSE", color='#e0e0e0', fontsize=9)
    ax.tick_params(colors='#e0e0e0', labelsize=8)
    for spine in ax.spines.values():
        spine.set_edgecolor('#ffffff33')
    ax.grid(True, alpha=0.15, color='white')
    plt.tight_layout()

    document.getElementById("graphique").innerHTML = ""
    display(fig, target="graphique")
    plt.close()

    document.getElementById("statFinal").textContent  = f"{valeur:.1f}"
    document.getElementById("statErr").textContent    = f"{erreurs[-1]:.1f}"
    document.getElementById("statEtapes").textContent = f"{etapes_convergence}" if etapes_convergence < 30 else "> 30"

# Activer le bouton quand Python est prêt
btn = document.getElementById("runBtn")
btn.textContent = "▶ Simuler"
btn.disabled = False
s = document.getElementById("pyscript-status")
s.textContent = "Python prêt dans le navigateur !"
s.classList.add("ready")