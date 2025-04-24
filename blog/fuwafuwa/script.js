const fuwaList = document.querySelectorAll('.fuwa');
function animateFuwa() {
    fuwaList.forEach(fuwa => {
        const fuwaArea = document.getElementById('fuwaArea');
        const fuwaAreaRect = fuwaArea.getBoundingClientRect();
        const fuwaAreaRectWidth = fuwaAreaRect.width;
        const fuwaAreaRectHeight = fuwaAreaRect.height;
        const fuwaAreaRectCenterX = fuwaAreaRect.left + fuwaAreaRectWidth / 2;
        const fuwaAreaRectCenterY = fuwaAreaRect.top + fuwaAreaRectHeight / 2;


        const rect = fuwa.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const fuwaAreaRectCenterDistance = Math.sqrt(
            Math.pow(centerX - fuwaAreaRectCenterX, 2) +
            Math.pow(centerY - fuwaAreaRectCenterY, 2)
        );

        const fuwaAreaRectCenterAngle = Math.atan2(centerY - fuwaAreaRectCenterY, centerX - fuwaAreaRectCenterX);
        const fuwaAreaRectCenterSpeed = Math.pow(fuwaAreaRectCenterDistance, 2) / 10000;
        let moveX = - Math.cos(fuwaAreaRectCenterAngle) * fuwaAreaRectCenterSpeed;
        let moveY = - Math.sin(fuwaAreaRectCenterAngle) * fuwaAreaRectCenterSpeed;

        let otherFuwaList = Array.from(fuwaList).filter(obj => obj !== fuwa);

        otherFuwaList.forEach(otherFuwa => {
            const otherRect = otherFuwa.getBoundingClientRect();
            const otherX = otherRect.left + otherRect.width / 2;
            const otherY = otherRect.top + otherRect.height / 2;

            const dx = centerX - otherX;
            const dy = centerY - otherY;
            const angle = Math.atan2(dy, dx);
            const spanX = dx - fuwaAreaRectWidth / 2 - otherRect.width / 2;
            const spanY = dy - fuwaAreaRectHeight / 2 - otherRect.height / 2;
            const spanDistance = Math.sqrt(spanX * spanX + spanY * spanY);
            // 距離に応じてスピード調整（近いほど大きく動く）
            const speed = Math.pow(Math.max(1, 10 - spanDistance), 2) / 2;

            moveX += Math.cos(angle) * speed;
            moveY += Math.sin(angle) * speed;
        });

        // 現在の transform を取得して相対的に動かす
        const currentTransform = getComputedStyle(fuwa).transform;
        let currentX = 0, currentY = 0;

        if (currentTransform !== 'none') {
            const matrix = new DOMMatrix(currentTransform);
            currentX = matrix.m41;
            currentY = matrix.m42;
        }

        fuwa.style.transform = `translate(${currentX + moveX}px, ${currentY + moveY}px)`;
    });

    requestAnimationFrame(animateFuwa); // 続ける
}

// スタート
requestAnimationFrame(animateFuwa);


fuwaList.forEach(enableDrag);
// ドラッグ可能にする関数
function enableDrag(element) {
    let isDragging = false;

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault(); // 選択防止
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const transform = getComputedStyle(element).transform;
            let currentX = 0, currentY = 0;

            if (transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                currentX = matrix.m41;
                currentY = matrix.m42;
            }
            const rect = element.getBoundingClientRect();
            const offsetX = rect.width / 2;
            const offsetY = rect.height / 2;
            const fuwaArea = document.getElementById('fuwaArea');
            const fuwaAreaRect = fuwaArea.getBoundingClientRect();
            const x = e.pageX - offsetX - fuwaAreaRect.left;
            const y = e.pageY - offsetY - fuwaAreaRect.top;

            element.style.transform = `translate(${x}px, ${y}px)`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}
