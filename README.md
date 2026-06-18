# IoT Microservices Architecture - Capstone Project

**Author:** Előd Sorbán  
**Program:** PDAE (BBTE)  

Ez a projekt egy elosztott, felhőalapú IoT (Internet of Things) mikroszervíz architektúra implementációja. A rendszer Kubernetes (K3s) alapokon nyugszik, dedikált adatbázisokkal, automatizált CI/CD folyamatokkal és iparági sztenderd observability (megfigyelhetőségi) stackkel.

## 🏗 Architektúra és Technológiák

A rendszer szigorúan követi a mikroszervíz tervezési mintákat (pl. Database-per-service), az alábbi technológiai stack használatával:

* **Infrastruktúra:** Hetzner VPS, K3s (Lightweight Kubernetes)
* **Backend:** Node.js, Express.js (Device, Telemetry és Rule Engine szervizek)
* **Frontend:** React.js
* **Adatbázisok:** PostgreSQL (Device Service), MongoDB (Telemetry Service), Redis (Rule Engine)
* **Hálózat & Útválasztás:** Traefik Ingress Controller (Path-based routing)
* **Megfigyelhetőség (Observability):** * Metrikák: Prometheus + Grafana (`prom-client` integrációval a Node.js-ben)
  * Logok: Grafana Loki + Promtail
* **CI/CD:** GitHub Actions

---

## 🚀 Reprodukálási Útmutató (Setup Guide)

Az alábbi lépések követésével a teljes architektúra egy üres Linux (Ubuntu) szerveren reprodukálható.

### 1. Előfeltételek (Prerequisites)
* Egy publikus IP-címmel rendelkező VPS (pl. Hetzner, AWS, DigitalOcean).
* Root vagy sudo SSH hozzáférés a szerverhez.
* GitHub repository az alkalmazás forráskódjával.

### 2. Kubernetes (K3s) és Helm Telepítése
A szerverre belépve telepítsük a pillekönnyű K3s klasztert és a Helm csomagkezelőt:

```bash
# K3s telepítése
curl -sfL [https://get.k3s.io](https://get.k3s.io) | sh -

# Kubeconfig beállítása a Helm számára
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
echo "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml" >> ~/.bashrc

# Helm telepítése
curl [https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3](https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3) | bash
```

### 3. Az Alkalmazás Kitelepítése (Deployment)
A projekt tartalmazza a deklaratív Kubernetes konfigurációs fájlokat. Klónozd a repót a szerverre, majd alkalmazd a fájlokat:

```bash
git clone <A_TE_GITHUB_REPO_LINKED>
cd iot-capstone

# A teljes mikroszervíz hálózat, adatbázisok és ingress szabályok felhúzása
kubectl apply -f k8s/
```
*Megjegyzés: A Traefik Ingress automatikusan kezeli a bejövő HTTP (80) forgalmat. A frontend a `/` útvonalon, az API-k a `/api/...` útvonalakon érhetők el a szerver publikus IP címén.*

### 4. Observability Stack (Monitoring & Naplózás)

A rendszer átfogó megfigyelhetőséggel rendelkezik, amely egy dedikált `monitoring` névtérben fut.

#### Prometheus & Grafana (Metrikák)
```bash
kubectl create namespace monitoring
helm repo add prometheus-community [https://prometheus-community.github.io/helm-charts](https://prometheus-community.github.io/helm-charts)
helm repo update

# Kube-Prometheus-Stack telepítése
helm install observability prometheus-community/kube-prometheus-stack --namespace monitoring
```
*A Node.js szervizek metrikáinak gyűjtését a `k8s/service-monitor.yaml` fájl automatizálja.*

#### Loki & Promtail (Központosított Logok)
```bash
helm repo add grafana [https://grafana.github.io/helm-charts](https://grafana.github.io/helm-charts)
helm repo update

# Loki Stack telepítése (Grafana 11 kompatibilis verzióval)
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set promtail.enabled=true \
  --set loki.persistence.enabled=false \
  --set loki.image.tag=2.9.3
```

A Grafana műszerfal elérése port-forward segítségével:
```bash
kubectl port-forward --address 0.0.0.0 svc/observability-grafana 8080:80 -n monitoring
```
*(Belépés: böngészőben `http://<SZERVER_IP>:8080`, alapértelmezett hitelesítő adatok: admin / prom-operator)*

### 5. CI/CD Automatizáció
A projekt egy GitHub Actions munkafolyamatra (Workflow) támaszkodik. Bármilyen `main` ágra történő Push esetén a rendszer:
1. Újraépíti a Docker image-eket.
2. Feltölti őket a konténer regiszterbe.
3. SSH-n keresztül bejelentkezik a K3s szerverre, és frissíti a futó podokat (`kubectl rollout restart`).

A működéshez a GitHub repository `Secrets` menüjében be kell állítani a szerver SSH kulcsait és hozzáférési adatait.

---

## 📁 Projekt Struktúra
* `/device-service` - Eszközök nyilvántartása és kezelése (Node.js + Postgres)
* `/telemetry-service` - Szenzoradatok gyűjtése és tárolása (Node.js + Mongo)
* `/rule-engine-service` - Riasztások és szabályok kiértékelése (Node.js + Redis)
* `/frontend-service` - Felhasználói felület (React)
* `/k8s` - Kubernetes YAML definíciók (Deployment, Service, Ingress, Secrets, ServiceMonitor)