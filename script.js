document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('canvas');
    const createNodeButton = document.getElementById('createNodeButton');
    const clearNodesButton = document.getElementById('clearNodesButton');

    let nodeCounter = 1;

    function createNode(type = 'blue-node', parentId = null) {
        const newNode = document.createElement('div');
        newNode.classList.add('node', type);
        newNode.id = 'node' + nodeCounter++;
        newNode.setAttribute('data-type', type);
    
        if (parentId) {
            newNode.setAttribute('data-parent', parentId);
            const parentNode = document.getElementById(parentId);
            const parentRect = parentNode.getBoundingClientRect();
            const transform = panzoomInstance.getTransform();
    
            // Найдем количество уже существующих дочерних нод
            const existingChildren = document.querySelectorAll(`.node[data-parent="${parentId}"]`).length;
    
            // Устанавливаем позицию новой ноды с учетом количества существующих дочерних нод
            const offsetX = existingChildren * 20;  // Отступ по горизонтали
            const offsetY = (parentRect.height + 50) * (existingChildren + 1);  // Отступ по вертикали
    
            newNode.style.top = (parentRect.top + offsetY - transform.y) / transform.scale + 'px';
            newNode.style.left = (parentRect.left + offsetX - transform.x) / transform.scale + 'px';
        } else {
            // Устанавливаем позицию новой ноды по умолчанию
            newNode.style.top = '100px';
            newNode.style.left = '100px';
        }
    
        newNode.innerHTML = 'Новая ячейка';
    
        if (type !== 'red-node') {
            addPlusButton(newNode);
        }
    
        canvas.appendChild(newNode);
        addNodeEvents(newNode);
    
        if (parentId) {
            const parentNode = document.getElementById(parentId);
            if (parentNode) {
                drawLine(parentNode, newNode);
            }
        }
        saveToLocalStorage();
    }

    function addPlusButton(node) {
        const plusButton = document.createElement('button');
        plusButton.classList.add('plus-button');
        plusButton.innerHTML = '+';
        node.appendChild(plusButton);
        plusButton.addEventListener('click', function() {
            if (node.classList.contains('yellow-node')) {
                createNode('red-node', node.id);
            } else if (node.classList.contains('blue-node')) {
                createNode('yellow-node', node.id);
            }
        });
        plusButton.addEventListener('touchstart', function() {
            if (node.classList.contains('yellow-node')) {
                createNode('red-node', node.id);
            } else if (node.classList.contains('blue-node')) {
                createNode('yellow-node', node.id);
            }
        });
    }

    function drawLine(parentNode, childNode) {
        const svg = document.querySelector('.connection-svg') || createSVG();
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('stroke', 'white');
        line.setAttribute('stroke-width', 6); //размер линии
        line.classList.add('connection-line');
        line.setAttribute('data-parent', parentNode.id);
        line.setAttribute('data-child', childNode.id);
        svg.appendChild(line);

        function updateLinePosition() {
            const parentRect = parentNode.getBoundingClientRect();
            const childRect = childNode.getBoundingClientRect();
            const transform = panzoomInstance.getTransform();

            line.setAttribute('x1', (parentRect.left + parentRect.width / 2 - transform.x) / transform.scale);
            line.setAttribute('y1', (parentRect.top + parentRect.height / 2 - transform.y) / transform.scale);
            line.setAttribute('x2', (childRect.left + childRect.width / 2 - transform.x) / transform.scale);
            line.setAttribute('y2', (childRect.top + childRect.height / 2 - transform.y) / transform.scale);
        }

        updateLinePosition();

        const observer = new MutationObserver(updateLinePosition);
        observer.observe(parentNode, { attributes: true });
        observer.observe(childNode, { attributes: true });

        window.addEventListener('resize', updateLinePosition);
        panzoomInstance.on('transform', updateLinePosition);
    }

    function createSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = 0;
        svg.style.left = 0;
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.classList.add('connection-svg');
        canvas.insertBefore(svg, canvas.firstChild); // Вставляем SVG перед первым дочерним элементом canvas
        return svg;
    }

    createNodeButton.addEventListener('click', () => createNode());
    createNodeButton.addEventListener('touchstart', () => createNode());

    clearNodesButton.addEventListener('click', () => clearNodes());
    clearNodesButton.addEventListener('touchstart', () => clearNodes());

    function addNodeEvents(node) {
        function onMouseDown(event) {
            if (event.target.tagName.toLowerCase() === 'textarea' || event.target.tagName.toLowerCase() === 'button') {
                return;
            }
    
            event.stopPropagation();
            const transform = panzoomInstance.getTransform();
            let shiftX = (event.clientX - node.getBoundingClientRect().left) / transform.scale;
            let shiftY = (event.clientY - node.getBoundingClientRect().top) / transform.scale;
    
            function moveAt(pageX, pageY) {
                const transform = panzoomInstance.getTransform();
                node.style.left = (pageX - shiftX * transform.scale - transform.x) / transform.scale + 'px';
                node.style.top = (pageY - shiftY * transform.scale - transform.y) / transform.scale + 'px';
            }
    
            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }
    
            document.addEventListener('mousemove', onMouseMove);
    
            node.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', onMouseMove);
                node.onmouseup = null;
                saveToLocalStorage();
            });
    
            node.ondragstart = function() {
                return false;
            };
        }
    
        function onTouchStart(event) {
            if (event.target.tagName.toLowerCase() === 'textarea' || event.target.tagName.toLowerCase() === 'button') {
                return;
            }
    
            event.stopPropagation();
            const transform = panzoomInstance.getTransform();
            let shiftX = (event.touches[0].clientX - node.getBoundingClientRect().left) / transform.scale;
            let shiftY = (event.touches[0].clientY - node.getBoundingClientRect().top) / transform.scale;
    
            function moveAt(pageX, pageY) {
                const transform = panzoomInstance.getTransform();
                node.style.left = (pageX - shiftX * transform.scale - transform.x) / transform.scale + 'px';
                node.style.top = (pageY - shiftY * transform.scale - transform.y) / transform.scale + 'px';
            }
    
            function onTouchMove(event) {
                moveAt(event.touches[0].pageX, event.touches[0].pageY);
            }
    
            document.addEventListener('touchmove', onTouchMove);
    
            node.addEventListener('touchend', function() {
                document.removeEventListener('touchmove', onTouchMove);
                node.ontouchend = null;
                saveToLocalStorage();
            });
    
            node.ondragstart = function() {
                return false;
            };
        }
    
        node.addEventListener('mousedown', onMouseDown);
        node.addEventListener('touchstart', onTouchStart);
    
        if (!node.querySelector('.edit-button')) {
            const editButton = document.createElement('button');
            editButton.classList.add('edit-button');
            editButton.innerText = 'Edit';
            node.appendChild(editButton);
            attachEditEvent(editButton, node);
        }
    
        if (!node.querySelector('.delete-button')) {
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.innerText = '×';
            node.appendChild(deleteButton);
            deleteButton.addEventListener('click', function() {
                if (confirm("Вы уверены, что хотите удалить эту ноду?")) {
                    deleteNodeWithChildren(node);
                    saveToLocalStorage();
                }
            });
    
            deleteButton.addEventListener('touchstart', function() {
                if (confirm("Вы уверены, что хотите удалить эту ноду?")) {
                    deleteNodeWithChildren(node);
                    saveToLocalStorage();
                }
            });
        }
    }

    function deleteNodeWithChildren(node) {
        const nodesToDelete = [node];
        const linesToDelete = [];

        while (nodesToDelete.length > 0) {
            const currentNode = nodesToDelete.pop();

            // Find and add child nodes to the list
            const childNodes = document.querySelectorAll('.node[data-parent="' + currentNode.id + '"]');
            childNodes.forEach(child => {
                nodesToDelete.push(child);
            });

            // Find and add associated lines to the list
            const associatedLines = document.querySelectorAll('.connection-line[data-parent="' + currentNode.id + '"], .connection-line[data-child="' + currentNode.id + '"]');
            associatedLines.forEach(line => {
                linesToDelete.push(line);
            });

            // Remove the current node
            currentNode.remove();
        }

        // Remove all associated lines
        linesToDelete.forEach(line => {
            line.remove();
        });
    }

    function attachEditEvent(editButton, node) {
        editButton.addEventListener('click', function() {
            const currentText = node.querySelector('textarea') ? node.querySelector('textarea').value : node.innerHTML.replace(/<button[^>]*>(.*?)<\/button>/g, '').replace(/<br\s*\/?>/gi, '\n').trim();
            node.innerHTML = `<div class='edit-container'><textarea>${currentText}</textarea><button class='save-button'>Save</button></div>`;
            const textarea = node.querySelector('textarea');
            const saveButton = node.querySelector('.save-button');
            textarea.focus();
            textarea.select();
    
            saveButton.style.display = 'block';
    
            textarea.addEventListener('mousedown', function(event) {
                event.stopPropagation();
            });
    
            textarea.addEventListener('touchstart', function(event) {
                event.stopPropagation();
            });
    
            saveButton.addEventListener('mousedown', function(event) {
                event.stopPropagation();
            });
    
            saveButton.addEventListener('touchstart', function(event) {
                event.stopPropagation();
            });
    
            saveButton.addEventListener('click', function() {
                const newText = textarea.value;
                node.innerHTML = newText.replace(/\n/g, '<br>');
                node.appendChild(editButton);
                if (node.querySelector('.delete-button')) {
                    const deleteButton = node.querySelector('.delete-button');
                    node.appendChild(deleteButton);
                } else {
                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('delete-button');
                    deleteButton.innerText = '×';
                    node.appendChild(deleteButton);
                    deleteButton.addEventListener('click', function() {
                        if (confirm("Вы уверены, что хотите удалить эту ноду?")) {
                            deleteNodeWithChildren(node);
                            saveToLocalStorage();
                        }
                    });
    
                    deleteButton.addEventListener('touchstart', function() {
                        if (confirm("Вы уверены, что хотите удалить эту ноду?")) {
                            deleteNodeWithChildren(node);
                            saveToLocalStorage();
                        }
                    });
                }
                attachEditEvent(editButton, node);
                if (node.getAttribute('data-type') !== 'red-node') {
                    addPlusButton(node);
                }
                saveToLocalStorage();
            });
        });
    
        editButton.addEventListener('touchstart', function() {
            const currentText = node.querySelector('textarea') ? node.querySelector('textarea').value : node.innerHTML.replace(/<button[^>]*>(.*?)<\/button>/g, '').replace(/<br\s*\/?>/gi, '\n').trim();
            node.innerHTML = `<div class='edit-container'><textarea>${currentText}</textarea><button class='save-button'>Save</button></div>`;
            const textarea = node.querySelector('textarea');
            const saveButton = node.querySelector('.save-button');
            textarea.focus();
            textarea.select();
    
            saveButton.style.display = 'block';
    
            textarea.addEventListener('mousedown', function(event) {
                event.stopPropagation();
            });
    
            textarea.addEventListener('touchstart', function(event) {
                event.stopPropagation();
            });
    
            saveButton.addEventListener('mousedown', function(event) {
                event.stopPropagation();
            });
    
            saveButton.addEventListener('touchstart', function(event) {
                event.stopPropagation();
            });
    
            saveButton.addEventListener('click', function() {
                const newText = textarea.value;
                node.innerHTML = newText.replace(/\n/g, '<br>');
                node.appendChild(editButton);
                if (node.querySelector('.delete-button')) {
                    const deleteButton = node.querySelector('.delete-button');
                    node.appendChild(deleteButton);
                } else {
                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('delete-button');
                    deleteButton.innerText = '×';
                    node.appendChild(deleteButton);
                    deleteButton.addEventListener('click', function() {
                        if (confirm("Вы уверены, что хотите удалить эту ноду?")) {
                            deleteNodeWithChildren(node);
                            saveToLocalStorage();
                        }
                    });
    
                    deleteButton.addEventListener('touchstart', function() {
                        if (confirm("Вы уверены, что хотите удалить эту ноду?")) {
                            deleteNodeWithChildren(node);
                            saveToLocalStorage();
                        }
                    });
                }
                attachEditEvent(editButton, node);
                if (node.getAttribute('data-type') !== 'red-node') {
                    addPlusButton(node);
                }
                saveToLocalStorage();
            });
        });
    }
    function saveToLocalStorage() {
        const nodeData = [];
        const lineData = [];
        document.querySelectorAll('.node').forEach(node => {
            const textarea = node.querySelector('textarea');
            const text = textarea ? textarea.value : node.innerHTML.replace(/<button[^>]*>(.*?)<\/button>/g, '').replace(/<br\s*\/?>/gi, '\n').trim();
            nodeData.push({
                id: node.id,
                text: text,
                left: node.style.left,
                top: node.style.top,
                parent: node.getAttribute('data-parent') || null,
                type: node.getAttribute('data-type')
            });
        });
        document.querySelectorAll('.connection-line').forEach(line => {
            const parentNode = line.getAttribute('data-parent');
            const childNode = line.getAttribute('data-child');
            lineData.push({
                parent: parentNode,
                child: childNode
            });
        });
        localStorage.setItem('nodeData', JSON.stringify(nodeData));
        localStorage.setItem('lineData', JSON.stringify(lineData));
    }

    function loadFromLocalStorage() {
        const nodeData = JSON.parse(localStorage.getItem('nodeData'));
        const lineData = JSON.parse(localStorage.getItem('lineData'));
        if (nodeData) {
            nodeData.forEach(data => {
                const node = document.createElement('div');
                node.classList.add('node', data.type);
                node.id = data.id;
                node.style.left = data.left;
                node.style.top = data.top;
                node.innerHTML = data.text.replace(/\n/g, '<br>');
                node.setAttribute('data-type', data.type);
                if (data.parent) {
                    node.setAttribute('data-parent', data.parent);
                }
                if (data.type !== 'red-node') {
                    addPlusButton(node);
                }
                canvas.appendChild(node);
                addNodeEvents(node);
            });
        }
        if (lineData) {
            lineData.forEach(data => {
                const parentNode = document.getElementById(data.parent);
                const childNode = document.getElementById(data.child);
                if (parentNode && childNode) {
                    drawLine(parentNode, childNode);
                }
            });
        }
    }

    function clearNodes() {
        document.querySelectorAll('.node').forEach(node => node.remove());
        document.querySelectorAll('.connection-line').forEach(line => line.remove());
        localStorage.removeItem('nodeData');
        localStorage.removeItem('lineData');
    }

    const panzoomInstance = panzoom(canvas, {
        bounds: true,
        boundsPadding: 0.1,
        minZoom: 0.5,
        maxZoom: 3,
        handleTouch: true  // Ensure this option is enabled
    });

    canvas.addEventListener('mousedown', function() {
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mouseup', function() {
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('touchstart', function() {
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('touchend', function() {
        canvas.style.cursor = 'grab';
    });

    loadFromLocalStorage();
});
