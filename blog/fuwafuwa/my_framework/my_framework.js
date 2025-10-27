export class FuwaFuwa {
    #parent;
    #container;
    #container_offset_left;
    #container_offset_top;
    #simulationInterval;
    constructor(parent) {
        this.name = "FuwaFuwa";
        this.version = "0.0.1";
        this.author = "ak-2302";
        this.description = "A simple framework for creating web applications.";
        this.license = "MIT";
        this.license_url = "https://opensource.org/licenses/MIT";
        this.license_text = `MIT License`;
        this.movespeed = 1; // 一度にどれだけ移動するか
        this.margin = 0; // オブジェクト間の余白をどれだけ許容するか
        this.smooth = 1; // 1秒間に何回移動するか
        this.DEBUG = false;
        this.#init(parent);
    }
    activate_debug() {
        this.DEBUG = true;
        this.add_center_point();
        console.log("DEBUG MODE ON");
    }
    deactivate_debug() {
        this.DEBUG = false;
        this.#container.querySelectorAll(".fuwa-fuwa-center-point").forEach((e) => {
            e.remove();
        });
        console.log("DEBUG MODE OFF");
    }


    #init(parent) {
        this.#parent = parent;
        this.#container = document.createElement("div");
        this.#container.backgroundColor = "red";
        this.#container.style.width = "50vw";
        this.#container.style.height = "50vh";
        this.#container.className = "fuwa-fuwa-container";
        this.#container_offset_left = parent.offsetLeft;
        this.#container_offset_top = parent.offsetTop;
        this.#parent.appendChild(this.#container);
    }

    add_center_point() {
        const rect = this.#container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const centerPoint = document.createElement("div");
        centerPoint.className = "fuwa-fuwa-center-point";
        centerPoint.style.position = "absolute";
        centerPoint.style.left = `${this.#container_offset_left + centerX}px`;
        centerPoint.style.top = `${this.#container_offset_top + centerY}px`;
        centerPoint.style.width = "10px";
        centerPoint.style.height = "10px";
        centerPoint.style.backgroundColor = "red";
        centerPoint.style.borderRadius = "50%";
        centerPoint.style.zIndex = "9999";
        this.#container.appendChild(centerPoint);
        // 中心点の座標を返す
        return { centerX, centerY };
    }
    add_center_line() {
        const rect = this.#container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const centerLineX = document.createElement("div");
        const centerLineY = document.createElement("div");
        centerLineX.style.position = "absolute";
        centerLineX.style.left = `${centerX}px`;
        centerLineX.style.top = `${rect.top}px`;
        centerLineX.style.width = "1px";
        centerLineX.style.height = `${rect.height}px`;
        centerLineX.style.backgroundColor = "red";
        centerLineX.style.zIndex = "9999";
        centerLineX.className = "fuwa-fuwa-center-line";
        centerLineY.style.position = "absolute";
        centerLineY.style.left = `${rect.left}px`;
        centerLineY.style.top = `${centerY}px`;
        centerLineY.style.width = `${rect.width}px`;
        centerLineY.style.height = "1px";
        centerLineY.style.backgroundColor = "red";
        centerLineY.style.zIndex = "9999";
        centerLineY.className = "fuwa-fuwa-center-line";
        this.#container.appendChild(centerLineX);
        this.#container.appendChild(centerLineY);
        // 中心線の座標を返す
        return { centerX, centerY };
    }

    paint_background(color) {
        if (color === undefined) {
            color = "rgba(200, 100, 200, 20)";
        }
        this.#container.style.backgroundColor = color;
    }

    addElement(element) {
        const containerRect = this.#container.getBoundingClientRect();
        const wrapperRect = element.getBoundingClientRect();
        const wrapper_template = document.createElement("div");
        wrapper_template.className = "fuwa-fuwa-wrapper";
        wrapper_template.style.position = "absolute";
        wrapper_template.style.transition = `all ${1 / this.smooth}s linear`;
        const x = Math.random() * (containerRect.width - wrapperRect.width);
        const y = Math.random() * (containerRect.height - wrapperRect.height);
        wrapper_template.style.left = `${x}px`;
        wrapper_template.style.top = `${y}px`;
        wrapper_template.appendChild(element);
        this.#container.appendChild(wrapper_template);
        this.#enableDrag(wrapper_template);
    }

    #enableSimulation(element) {
        let container_rect = this.#container.getBoundingClientRect();
        let container_width = container_rect.width;
        let container_height = container_rect.height;
        let container_center_x = container_rect.left + container_width / 2;
        let container_center_y = container_rect.top + container_height / 2;
        let element_rect = element.getBoundingClientRect();
        let element_width = element_rect.width;
        let element_height = element_rect.height;
        let element_center_x = element_rect.left + element_width / 2;
        let element_center_y = element_rect.top + element_height / 2;
        let distanceX = container_center_x - element_center_x;
        let distanceY = container_center_y - element_center_y;
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        let speed = Math.pow(distance, 1.5) * this.movespeed / 100;
        //containerの形状に応じて移動する向きを調整
        let angle = Math.atan2(distanceY, distanceX);
        //距離が離れているほど速く中心へ移動する
        let moveX = speed * Math.cos(angle);
        let moveY = speed * Math.sin(angle);
        console.log(`distanceX: ${distanceX}, distanceY: ${distanceY} angle: ${angle}`);
        console.log(`cos(angle): ${Math.cos(angle)}, sin(angle): ${Math.sin(angle)}`);

        this.#container.querySelectorAll(".fuwa-fuwa-wrapper").forEach((other_element) => {
            if (other_element === element) return;
            let other_element_rect = other_element.getBoundingClientRect();
            let other_element_width = other_element_rect.width;
            let other_element_height = other_element_rect.height;
            let other_element_center_x = other_element_rect.left + other_element_width / 2;
            let other_element_center_y = other_element_rect.top + other_element_height / 2;
            let distanceX = other_element_center_x - element_center_x;
            let distanceY = other_element_center_y - element_center_y;
            let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            let angle = Math.atan2(distanceY, distanceX);
            //距離が近いほど速く移動する
            console.log(`calc.`);
            let speed = 1 / distance * this.movespeed / 100;
            moveX += speed * - Math.cos(angle);
            moveY += speed * - Math.sin(angle);
            //重なりがある場合には、強く反発するように移動する
            let overlapX = Math.abs(distanceX) - (element_width + other_element_width) / 2 - this.margin;
            let overlapY = Math.abs(distanceY) - (element_height + other_element_height) / 2 - this.margin;
            if (overlapX < 0) {
                moveX += (overlapX / Math.abs(overlapX)) * this.movespeed;
            }
            if (overlapY < 0) {
                moveY += (overlapY / Math.abs(overlapY)) * this.movespeed;
            }
        }
        );
        element.style.left = `${element.offsetLeft + moveX}px`;
        element.style.top = `${element.offsetTop + moveY}px`;
    }
    #enableSimulationAll() {
        this.#container.querySelectorAll(".fuwa-fuwa-wrapper").forEach((element) => {
            this.#enableSimulation(element);
        });
    }

    startSimulation() {
        this.#simulationInterval = setInterval(() => {
            this.#enableSimulationAll();
        }, 1000 / this.smooth);
    }
    stopSimulation() {
        clearInterval(this.#simulationInterval);
    }

    #enableDrag(element) {
        let isDragging = false;
        element.addEventListener("mousedown", (e) => {
            isDragging = true;
            e.preventDefault(); // 選択防止
        });
        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
                const transform = getComputedStyle(element).transform;
                let currentX = 0,
                    currentY = 0;

                if (transform !== "none") {
                    const matrix = new DOMMatrix(transform);
                    currentX = matrix.m41;
                    currentY = matrix.m42;
                }
                const rect = element.getBoundingClientRect();
                const offsetX = e.clientX - rect.width / 2;
                const offsetY = e.clientY - rect.height / 2;
                element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            }
        });
        document.addEventListener("mouseup", () => {
            isDragging = false;
        });
    }
    #enableDragAll() {
        this.#container.querySelectorAll(".fuwa-fuwa-element").forEach((element) => {
            this.#enableDrag(element);
        });
    }
}