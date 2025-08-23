// ==UserScript==
// @name         Vortex Client
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Vortex Client for Bloxd.io with module functions
// @author       GEORGECR
// @homepageURL  https://georgecr0.github.io/Vortex-Client/
// @icon         https://i.postimg.cc/fRpcmPqN/Vortex-Logo.png
// @match        https://bloxd.io/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/GEORGECR0/Vortex_Client_Code/main/Vortex_Client.user.js
// @updateURL    https://raw.githubusercontent.com/GEORGECR0/Vortex_Client_Code/main/Vortex_Client.user.js
// ==/UserScript==

(function () {
    'use strict';

    const storageKey = 'vortexClientModuleStates';

    //MODULES (this is not ai bruh its just so its more clean)
    const modules = {
        'Combat': [
            {
                name: 'Keystrokes', description: 'Displays movement keys\nand clicks on screen.', hasSettings: true, enabled: true,
                onEnable: () => { console.log("Keystrokes enabled"); },
                onDisable: () => { console.log("Keystrokes disabled"); }
            },
            {
                name: 'Combat Log Timer', description: 'Tracks the time since\nyour last combat log.', enabled: false,
                onEnable: () => console.log("Combat Log Timer enabled"),
                onDisable: () => console.log("Combat Log Timer disabled")
            },
        ],
        'Visual': [
            {
                name: 'Armour View', description: 'Shows your armor status\nand durability.', hasSettings: true, enabled: true,
                onEnable: () => console.log("Armour View enabled"),
                onDisable: () => console.log("Armour View disabled")
            },
            {
                name: 'Cps Counter', description: 'Displays your clicks per\nsecond (CPS).', enabled: true,
                onEnable: () => cpsModule.start(),
                onDisable: () => cpsModule.stop()
            },
            {
                name: 'Ping Counter', description: 'Shows your current ping\nto the server.', enabled: false,
                onEnable: () => pingModule.start(),
                onDisable: () => pingModule.stop()
            },
        ],
        'Player': [],
        'Utility': [
            {
                name: 'Resolution Adjuster', description: 'Change game resolution\nwithout restarting.', hasSettings: true, enabled: false,
                onEnable: () => console.log("Resolution Adjuster enabled"),
                onDisable: () => console.log("Resolution Adjuster disabled")
            },
            {
                name: 'Notifications', description: 'Show alerts for events\nand key actions.', enabled: true,
                onEnable: () => console.log("Notifications enabled"),
                onDisable: () => console.log("Notifications disabled")
            },
            {
                name: 'Cinematic Mode', description: 'Smooth camera motion\nfor cinematic use.', hasSettings: true, enabled: false,
                onEnable: () => console.log("Cinematic Mode enabled"),
                onDisable: () => console.log("Cinematic Mode disabled")
            },
        ],
        'Cosmetics': [
            {
                name: 'Nametags', description: 'Customize appearance\nof player nametags.', hasSettings: true, enabled: false,
                onEnable: () => console.log("Nametags enabled"),
                onDisable: () => console.log("Nametags disabled")
            },
            {
                name: 'Custom Cape', description: 'Equip and display your\npersonalized cape.', hasSettings: true, enabled: true,
                onEnable: () => console.log("Custom Cape enabled"),
                onDisable: () => console.log("Custom Cape disabled")
            },
        ],
        'Settings': []
    };

    function getModuleByName(moduleName) {
        for (const category of Object.values(modules)) {
            const foundModule = category.find(m => m.name === moduleName);
            if (foundModule) {
                return foundModule;
            }
        }
        return null;
    }

    function initializeModules() {
        const savedStates = JSON.parse(localStorage.getItem(storageKey)) || {};

        Object.values(modules).flat().forEach(module => {
            const isEnabled = savedStates[module.name] !== undefined ? savedStates[module.name] : module.enabled;

            if (isEnabled && typeof module.onEnable === 'function') {
                console.log(`Auto-enabling ${module.name}`);
                module.onEnable();
            }
        });
    }

    //CLIENT UI & SHIT (this is not ai bruh its just so its more clean)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css';
    document.head.appendChild(link);

    const gameui = document.querySelector('.WholeAppWrapper');
    gameui.style.display = 'block';
    gameui.style.filter = 'grayscale(80%) brightness(0.6)';
    gameui.style.transition = 'all 0.2s ease';

    let menuInterval, gameInterval;
    const ClientHud = document.createElement('div');
    ClientHud.style.position = 'fixed';
    ClientHud.style.left = '0px';
    ClientHud.style.top = '0px';
    ClientHud.style.backgroundColor = 'transparent';
    ClientHud.style.width = '100%';
    ClientHud.style.height = '100%';
    ClientHud.style.display = 'block';
    ClientHud.style.zIndex = '1';
    ClientHud.style.pointerEvents = 'none';
    document.body.appendChild(ClientHud);

    function inMenu() {
        ClientHud.style.display = 'none';
    }

    function inGame() {
        ClientHud.style.display = 'block';
    }

    function checkState() {
        const homePage = document.querySelector(".HomePage");
        if (homePage && window.getComputedStyle(homePage).display !== "none") {

            if (!menuInterval) {
                menuInterval = setInterval(inMenu, 1000);
            }
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            }
        } else {

            if (!gameInterval) {
                gameInterval = setInterval(inGame, 1000);
            }
            if (menuInterval) {
                clearInterval(menuInterval);
                menuInterval = null;
            }
        }
    }

    checkState();

    setInterval(checkState, 1000);


    const hud = document.createElement('div');
    hud.style.position = 'fixed';
    hud.style.top = '0';
    hud.style.left = '0';
    hud.style.width = '100%';
    hud.style.height = '100%';
    hud.style.zIndex = '999999';
    hud.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    hud.style.pointerEvents = 'auto';
    hud.style.backdropFilter = 'blur(5px)';
    hud.style.transition = 'all 0.2s ease';
    document.body.appendChild(hud);

    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.width = '30vw';
    menu.style.height = '40vh';
    menu.style.maxWidth = '500px';
    menu.style.maxHeight = '400px';
    menu.style.minWidth = '300px';
    menu.style.minHeight = '250px';
    menu.style.zIndex = '1000000';
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';
    menu.style.justifyContent = 'center';
    menu.style.alignItems = 'center';
    menu.style.backgroundImage = 'url(https://i.postimg.cc/fyR7DMPB/Vortex-Client-png.png)';
    menu.style.backgroundRepeat = 'no-repeat';
    menu.style.backgroundSize = '265px 230px';
    menu.style.backgroundPosition = 'center calc(50% - 70px)';
    hud.appendChild(menu);

    const mainMenuCon = document.createElement('div');
    mainMenuCon.style.width = '50vw';
    mainMenuCon.style.height = '65vh';
    mainMenuCon.style.position = 'fixed';
    mainMenuCon.style.top = '50%';
    mainMenuCon.style.left = '50%';
    mainMenuCon.style.transform = 'translate(-50%, -50%)';
    mainMenuCon.style.display = 'none';
    mainMenuCon.style.flexDirection = 'column';
    mainMenuCon.style.justifyContent = 'center';
    mainMenuCon.style.alignItems = 'center';
    mainMenuCon.style.maxWidth = '1000px';
    mainMenuCon.style.maxHeight = '800px';
    mainMenuCon.style.minWidth = '900px';
    mainMenuCon.style.minHeight = '700px';
    hud.appendChild(mainMenuCon);

    const mainMenu = document.createElement('div');
    mainMenu.style.width = '50vw';
    mainMenu.style.height = '45vh';
    mainMenu.style.zIndex = '999999';
    mainMenu.style.position = 'relative';
    mainMenu.style.backdropFilter = 'blur(0.45rem)';
    mainMenu.style.backgroundColor = 'rgba(10, 12, 16, 0.6)';
    mainMenu.style.borderRadius = '1rem';
    mainMenu.style.padding = '20px';
    mainMenu.style.border = '1px solid rgba(255, 255, 255, 0.07)';
    mainMenu.style.display = 'flex';
    mainMenu.style.justifyContent = 'center';
    mainMenu.style.alignItems = 'center';
    mainMenu.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    mainMenu.style.maxWidth = '1000px';
    mainMenu.style.maxHeight = '550px';
    mainMenu.style.minWidth = '900px';
    mainMenu.style.minHeight = '550px';
    mainMenuCon.appendChild(mainMenu);

    const contentArea = document.createElement('div');
    contentArea.style.marginLeft = '230px';
    contentArea.style.padding = '20px';
    contentArea.style.width = 'calc(100% - 230px)';
    contentArea.style.height = '100%';
    contentArea.style.display = 'flex';
    contentArea.style.flexDirection = 'column';
    contentArea.style.alignItems = 'flex-start';
    contentArea.style.justifyContent = 'flex-start';
    contentArea.style.color = 'white';
    contentArea.style.fontSize = '18px';
    contentArea.style.fontWeight = 'bold';
    mainMenu.appendChild(contentArea);

    const tabBar = document.createElement('div');
    tabBar.style.width = '240px';
    tabBar.style.height = '100%';
    tabBar.style.display = 'flex';
    tabBar.style.flexDirection = 'column';
    tabBar.style.justifyContent = 'flex-start';
    tabBar.style.alignItems = 'center';
    tabBar.style.gap = '15px';
    tabBar.style.position = 'absolute';
    tabBar.style.top = '0';
    tabBar.style.left = '0';
    tabBar.style.borderRight = '1.4px solid rgba(255, 255, 255, 0.07)';
    tabBar.style.backgroundColor = 'rgba(0, 4, 9, 0.7)';
    tabBar.style.borderTopLeftRadius = '1rem';
    tabBar.style.borderBottomLeftRadius = '1rem';
    mainMenu.appendChild(tabBar);

    const logoWrapper = document.createElement('div');
    logoWrapper.style.display = 'flex';
    logoWrapper.style.flexDirection = 'column';
    logoWrapper.style.alignItems = 'center';
    logoWrapper.style.marginTop = '20px';
    tabBar.appendChild(logoWrapper);

    const sidebarLogo = document.createElement('img');
    sidebarLogo.src = 'https://i.postimg.cc/rwqnpQbv/logo-v2.png';
    sidebarLogo.style.width = '200px';
    sidebarLogo.style.height = 'auto';
    sidebarLogo.style.borderRadius = '0.4rem';
    logoWrapper.appendChild(sidebarLogo);

    const versionLabel = document.createElement('div');
    versionLabel.textContent = 'Version Beta';
    versionLabel.style.fontSize = '13px';
    versionLabel.style.fontWeight = 'lighter';
    versionLabel.style.color = 'rgba(255, 255, 255, 0.3)';
    versionLabel.style.marginTop = '-2px';
    logoWrapper.appendChild(versionLabel);

    const separator = document.createElement('div');
    separator.style.width = '85%';
    separator.style.height = '1px';
    separator.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
    separator.style.marginBottom = '5px';
    tabBar.appendChild(separator);

    const tabs = [
        { name: 'Combat', icon: 'ri-sword-fill', description: '#Modules for fighting and attacks' },
        { name: 'Visual', icon: 'ri-eye-fill', description: '#Modules for graphics and effects' },
        { name: 'Player', icon: 'ri-walk-fill', description: '#Modules for movement and stats' },
        { name: 'Utility', icon: 'ri-tools-fill', description: '#Modules for extra tools and functions' },
        { name: 'Cosmetics', icon: 'ri-magic-fill', description: '#Modules for skins and appearance' }
    ];

    const tabButtons = [];

    tabs.forEach((tab, index) => {
        const tabBtn = document.createElement('button');
        tabBtn.innerHTML = `<i class="${tab.icon}" style="margin-right:8px; font-size:18px;"></i> ${tab.name}`;
        tabBtn.style.width = '80%';
        tabBtn.style.height = '48px';
        tabBtn.style.display = 'flex';
        tabBtn.style.alignItems = 'center';
        tabBtn.style.justifyContent = 'flex-start';
        tabBtn.style.gap = '8px';
        tabBtn.style.padding = '10px';
        tabBtn.style.borderRadius = '8px';
        tabBtn.style.cursor = 'pointer';
        tabBtn.style.fontSize = '14px';
        tabBtn.style.fontWeight = 'bold';
        tabBtn.style.color = 'rgba(255, 255, 255, 0.35)';
        tabBtn.style.transition = 'all 0.35s ease';
        tabBtn.style.backgroundColor = 'transparent';
        tabBtn.style.border = 'none';
        tabBtn.style.boxShadow = 'none';

        if (index === 0) setActive(tabBtn);

        tabBtn.addEventListener('mouseover', () => {
            if (!tabBtn.classList.contains('active')) {
                tabBtn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                tabBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                tabBtn.style.color = 'rgba(255, 255, 255, 0.6)';
            }
        });

        tabBtn.addEventListener('mouseout', () => {
            if (!tabBtn.classList.contains('active')) {
                tabBtn.style.border = 'none';
                tabBtn.style.backgroundColor = 'transparent';
                tabBtn.style.color = 'rgba(255, 255, 255, 0.35)';
            }
        });

        tabBtn.addEventListener('click', () => {
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = 'transparent';
                btn.style.border = 'none';
                btn.style.boxShadow = 'none';
                btn.style.color = 'rgba(255, 255, 255, 0.35)';
            });
            setActive(tabBtn);
            setContent(tab.name, tab.description);
        });

        tabButtons.push(tabBtn);
        tabBar.appendChild(tabBtn);
    });

    function setActive(btn) {
        btn.classList.add('active');
        btn.style.backgroundColor = 'rgba(110, 40, 40, 0.8)';
        btn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        btn.style.boxShadow = '0px 0px 15px 0px rgb(110, 40, 40)';
        btn.style.color = 'white';
    }

    const bottomSeparator = document.createElement('div');
    bottomSeparator.style.width = '85%';
    bottomSeparator.style.height = '1.5px';
    bottomSeparator.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
    bottomSeparator.style.margin = '7px 0 7px 0';
    tabBar.appendChild(bottomSeparator);

    const footerButtons = [
        { name: 'Settings', icon: 'ri-settings-5-fill' },
        { name: 'Exit', icon: 'ri-logout-box-r-fill' }
    ];

    footerButtons.forEach(footer => {
        const fBtn = document.createElement('button');
        fBtn.innerHTML = `<i class="${footer.icon}" style="margin-right:8px; font-size:18px;"></i> ${footer.name}`;

        fBtn.style.width = '80%';
        fBtn.style.height = '48px';
        fBtn.style.display = 'flex';
        fBtn.style.alignItems = 'center';
        fBtn.style.justifyContent = 'flex-start';
        fBtn.style.gap = '8px';
        fBtn.style.padding = '8px';
        fBtn.style.borderRadius = '8px';
        fBtn.style.cursor = 'pointer';
        fBtn.style.fontSize = '14px';
        fBtn.style.fontWeight = 'bold';
        fBtn.style.color = 'rgba(255, 255, 255, 0.35)';
        fBtn.style.transition = 'all 0.3s ease';
        fBtn.style.backgroundColor = 'transparent';
        fBtn.style.border = 'none';

        fBtn.addEventListener('mouseover', () => {
            if (!fBtn.classList.contains('active')) {
                fBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                fBtn.style.color = 'rgba(255, 255, 255, 0.6)';
                fBtn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            }
        });

        fBtn.addEventListener('mouseout', () => {
            if (!fBtn.classList.contains('active')) {
                fBtn.style.backgroundColor = 'transparent';
                fBtn.style.color = 'rgba(255, 255, 255, 0.35)';
                fBtn.style.border = 'none';
            }
        });

        if (footer.name === 'Exit') {
            fBtn.addEventListener('click', () => {
                mainMenuCon.style.display = 'none';
                menu.style.display = 'flex';
            });
        } else if (footer.name === 'Settings') {
            fBtn.addEventListener('click', () => {
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = 'transparent';
                    btn.style.border = 'none';
                    btn.style.boxShadow = 'none';
                    btn.style.color = 'rgba(255, 255, 255, 0.35)';
                });
                setContent('Settings', '#Configure client settings');
                fBtn.classList.remove('active');
                fBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                fBtn.style.color = 'rgba(255, 255, 255, 0.6)';
                fBtn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            });
        }
        tabBar.appendChild(fBtn);
    });

    function createModuleCard(moduleName, iconClass, descriptionText, hasSettings = false, isEnabled = false) {
        const card = document.createElement('div');
        card.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        card.style.borderRadius = '12px';
        card.style.padding = '20px';
        card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        card.style.textAlign = 'center';
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

        const name = document.createElement('div');
        name.textContent = moduleName;
        name.style.marginTop = '10px';
        name.style.fontSize = '16px';
        name.style.fontWeight = 'bold';
        name.style.color = 'white';
        card.appendChild(name);

        const desc = document.createElement('div');
        desc.textContent = descriptionText;
        desc.style.fontSize = '12px';
        desc.style.color = 'rgba(255, 255, 255, 0.6)';
        desc.style.marginTop = '5px';
        card.appendChild(desc);

        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.justifyContent = 'center';
        controls.style.marginTop = '15px';
        controls.style.gap = '10px';

        const switchLabel = document.createElement('label');
        switchLabel.style.position = 'relative';
        switchLabel.style.display = 'inline-block';
        switchLabel.style.width = '54px';
        switchLabel.style.height = '28px';
        controls.appendChild(switchLabel);

        const switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.style.opacity = '0';
        switchInput.style.width = '0';
        switchInput.style.height = '0';
        switchLabel.appendChild(switchInput);

        const slider = document.createElement('span');
        slider.style.position = 'absolute';
        slider.style.cursor = 'pointer';
        slider.style.top = '0';
        slider.style.left = '0';
        slider.style.right = '0';
        slider.style.bottom = '0';
        slider.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        slider.style.transition = '.4s';
        slider.style.borderRadius = '34px';
        switchLabel.appendChild(slider);

        const sliderKnob = document.createElement('span');
        sliderKnob.style.position = 'absolute';
        sliderKnob.style.content = '""';
        sliderKnob.style.height = '20px';
        sliderKnob.style.width = '20px';
        sliderKnob.style.left = '4px';
        sliderKnob.style.bottom = '4px';
        sliderKnob.style.backgroundColor = 'white';
        sliderKnob.style.transition = '.4s';
        sliderKnob.style.borderRadius = '50%';
        slider.appendChild(sliderKnob);

        if (isEnabled) {
            switchInput.checked = true;
            slider.style.backgroundColor = 'rgba(110, 40, 40, 0.8)';
            sliderKnob.style.transform = 'translateX(26px)';
        }

        //ON  ENABLE & ON DISABLE SHIT (this is not ai bruh its just so its more clean)
        switchInput.addEventListener('change', () => {
            const isChecked = switchInput.checked;
            if (isChecked) {
                slider.style.backgroundColor = 'rgba(110, 40, 40, 0.8)';
                sliderKnob.style.transform = 'translateX(26px)';
            } else {
                slider.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                sliderKnob.style.transform = 'translateX(0)';
            }

            let savedStates = JSON.parse(localStorage.getItem(storageKey)) || {};
            savedStates[moduleName] = isChecked;
            localStorage.setItem(storageKey, JSON.stringify(savedStates));

            const module = getModuleByName(moduleName);
            if (!module) return;

            if (isChecked && typeof module.onEnable === 'function') {
                module.onEnable();
            } else if (!isChecked && typeof module.onDisable === 'function') {
                module.onDisable();
            }
        });

        if (hasSettings) {
            const settingsBtn = document.createElement('button');
            settingsBtn.innerHTML = '<i class="ri-settings-4-fill"></i>';
            settingsBtn.style.width = '28px';
            settingsBtn.style.height = '28px';
            settingsBtn.style.borderRadius = '10px';
            settingsBtn.style.border = 'none';
            settingsBtn.style.cursor = 'pointer';
            settingsBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            settingsBtn.style.color = 'white';
            settingsBtn.style.fontSize = '18px';
            settingsBtn.style.transition = 'background-color 0.3s ease';
            settingsBtn.style.display = 'flex';
            settingsBtn.style.alignItems = 'center';
            settingsBtn.style.justifyContent = 'center';

            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                alert(`Settings for ${moduleName} is not coded yet my felow beta tester`);
            });

            settingsBtn.addEventListener('mouseover', () => {
                settingsBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            });
            settingsBtn.addEventListener('mouseout', () => {
                settingsBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });

            controls.appendChild(settingsBtn);

        }

        card.appendChild(controls);

        card.addEventListener('mouseover', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseout', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });

        return card;
    }

    function setContent(tabName, tabDescription) {
        contentArea.style.position = 'relative';
        contentArea.innerHTML = '';

        const headerContainer = document.createElement('div');
        headerContainer.style.textAlign = 'center';
        headerContainer.style.width = '100%';
        headerContainer.style.marginBottom = '15px';
        contentArea.appendChild(headerContainer);

        const tabLabel = document.createElement('div');
        tabLabel.textContent = tabName;
        tabLabel.style.fontSize = '22px';
        tabLabel.style.fontWeight = 'bold';
        tabLabel.style.color = 'white';
        tabLabel.style.marginBottom = '5px';
        tabLabel.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.2)';
        tabLabel.style.transition = 'all 0.4s ease-in-out';
        headerContainer.appendChild(tabLabel);

        const description = document.createElement('div');
        description.textContent = tabDescription;
        description.style.fontSize = '11px';
        description.style.fontWeight = 'normal';
        description.style.color = 'rgba(255, 255, 255, 0.5)';
        description.style.textTransform = 'uppercase';
        headerContainer.appendChild(description);

        const separator = document.createElement('div');
        separator.style.width = '100%';
        separator.style.height = '1px';
        separator.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
        separator.style.marginBottom = '20px';
        contentArea.appendChild(separator);

        const gridContainer = document.createElement('div');
        gridContainer.style.width = '100%';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
        gridContainer.style.gap = '20px';
        gridContainer.style.padding = '10px';
        contentArea.appendChild(gridContainer);

        let savedStates = JSON.parse(localStorage.getItem(storageKey)) || {};

        const currentModules = modules[tabName] || [];
        currentModules.forEach(module => {
            const isEnabled = savedStates[module.name] !== undefined ? savedStates[module.name] : module.enabled;
            const card = createModuleCard(module.name, module.icon, module.description, module.hasSettings, isEnabled);
            gridContainer.appendChild(card);
        });
    }

    const createStyledButton = (options = {}) => {
        const btn = document.createElement('button');
        btn.style.width = options.width || '60px';
        btn.style.height = options.height || '60px';
        btn.style.backgroundImage = 'linear-gradient(45deg, rgba(0, 4, 9, 1) 40%, rgba(14, 14, 19, 1) 100%)';
        btn.style.backgroundSize = 'cover';
        btn.style.backgroundPosition = '0% 0%';
        btn.style.backgroundRepeat = 'repeat';
        btn.style.backgroundColor = 'transparent';
        btn.style.border = 'none';
        btn.style.borderRadius = '0.7rem';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = 'none';
        btn.style.fontSize = options.fontSize || '20px';
        btn.style.color = 'white';
        btn.style.transition = 'box-shadow 0.3s ease';
        btn.addEventListener('mouseover', function () {
            btn.style.transition = 'background-image 0.3s ease, box-shadow 0.3s ease';
            btn.style.backgroundImage = 'linear-gradient(45deg, rgba(110, 40, 40, 1) 40%, rgba(124, 54, 59, 1) 100%)';
            btn.style.boxShadow = '0px 0px 29px 0px rgb(110, 40, 40)';
        });
        btn.addEventListener('mouseout', function () {
            btn.style.transition = 'none';
            btn.style.backgroundImage = 'linear-gradient(45deg, rgba(0, 4, 9, 1) 40%, rgba(14, 14, 19, 1) 100%)';
            btn.style.boxShadow = 'none';
        });
        if (options.text) btn.textContent = options.text;
        if (options.html) btn.innerHTML = options.html;
        return btn;
    };

    const VortexContainer = document.createElement('div');
    VortexContainer.style.display = 'flex';
    VortexContainer.style.flexDirection = 'column';
    VortexContainer.style.alignItems = 'center';
    VortexContainer.style.gap = '10px';
    menu.appendChild(VortexContainer);

    const VortexSettingsBtn = createStyledButton({
        width: '250px',
        height: '60px',
        fontSize: '16px',
        text: 'Vortex Settings'
    });
    VortexSettingsBtn.style.marginTop = '120px';
    VortexSettingsBtn.addEventListener('click', function () {
        mainMenuCon.style.display = 'flex';
        menu.style.display = 'none';
        gameui.style.display = '';
    });
    VortexContainer.appendChild(VortexSettingsBtn);

    const VortexMenuBtnDiv = document.createElement('div');
    VortexMenuBtnDiv.style.width = '250px';
    VortexMenuBtnDiv.style.height = '60px';
    VortexMenuBtnDiv.style.display = 'flex';
    VortexMenuBtnDiv.style.flexDirection = 'row';
    VortexMenuBtnDiv.style.alignItems = 'center';
    VortexMenuBtnDiv.style.marginTop = '10px';
    VortexMenuBtnDiv.style.gap = '10px';
    menu.appendChild(VortexMenuBtnDiv);

    const icons = ['ri-settings-5-fill', 'ri-group-fill', 'ri-message-2-fill', 'ri-t-shirt-2-fill'];
    icons.forEach(icon => {
        const btn = createStyledButton({ html: `<i class="${icon}"></i>` });
        VortexMenuBtnDiv.appendChild(btn);
    });

    let menuVisible = true;
    const toggleMenuKey = 'ShiftRight';

    window.addEventListener('keydown', function (e) {
        if (e.code === toggleMenuKey) {
            menuVisible = !menuVisible;
            menu.style.display = menuVisible ? 'flex' : 'none';
            hud.style.backgroundColor = menuVisible ? 'rgba(0, 0, 0, 0.8)' : 'transparent';
            hud.style.backdropFilter = menuVisible ? 'blur(5px)' : 'blur(0px)';
            hud.style.pointerEvents = menuVisible ? 'auto' : 'none';
            mainMenuCon.style.display = 'none';
            gameui.style.display = 'block';
            gameui.style.filter = menuVisible ? 'grayscale(80%) brightness(0.6)' : 'grayscale(0%) brightness(1)';

            if (menuVisible && document.pointerLockElement) {
                document.exitPointerLock();
            }
        }
    });

    setContent(tabs[0].name, tabs[0].description);

    setTimeout(initializeModules, 2000);

    //CPS COUNTER MODULE (this is not ai bruh its just so its more clean)
    const cpsModule = (function () {
        let cpsHud = null;
        let clicksTextSpan = null;
        let clickListener = null;
        let updateIntervalId = null;
        let positionIntervalId = null;

        let leftClicks = 0;
        let rightClicks = 0;
        let lastLeftClickTime = 0;
        let lastRightClickTime = 0;

        const start = () => {
            if (cpsHud) return;
            cpsHud = document.createElement("div");
            cpsHud.style.position = "fixed";
            cpsHud.id = 'cpsDisplay';
            cpsHud.style.background = "rgba(0, 0, 0, 0.6)";
            cpsHud.style.color = "#fff";
            cpsHud.style.alignItems = 'center';
            cpsHud.style.justifyContent = 'center';
            cpsHud.style.fontWeight = '500';
            cpsHud.style.zIndex = '0.5';
            cpsHud.style.display = 'none';
            const cpsTextSpan = document.createElement("span");
            cpsTextSpan.style.color = "#cfcfcf";
            cpsTextSpan.innerText = "CPS ";
            cpsTextSpan.style.marginRight = '5px';
            clicksTextSpan = document.createElement("span");
            clicksTextSpan.style.color = "#fff";
            clicksTextSpan.innerText = "0 │ 0";
            cpsHud.appendChild(cpsTextSpan);
            cpsHud.appendChild(clicksTextSpan);
            ClientHud.appendChild(cpsHud);
            lastLeftClickTime = Date.now();
            lastRightClickTime = Date.now();
            clickListener = (e) => {
                if (e.button === 0) {
                    leftClicks++;
                } else if (e.button === 2) {
                    rightClicks++;
                }
            };
            document.addEventListener("mousedown", clickListener);

            const updateBoxPosition = () => {
                if (!cpsHud) return;

                const header = document.querySelector('.InGameHeader');
                if (!header || header.offsetHeight === 0) {
                    cpsHud.style.display = 'none';
                    return;
                }
                cpsHud.style.display = 'flex';

                const fps = document.querySelector('.FpsWrapperDiv');
                const coords = document.querySelectorAll('.CoordinateUI');
                const fpsVisible = fps && window.getComputedStyle(fps).display !== 'none';
                const visibleCoords = Array.from(coords).filter(c => window.getComputedStyle(c).display !== 'none');
                let targetRect = null;

                if (visibleCoords.length > 0) {
                    const rightmostCoord = visibleCoords.reduce((a, b) => a.getBoundingClientRect().right > b.getBoundingClientRect().right ? a : b);
                    targetRect = rightmostCoord.getBoundingClientRect();
                } else if (fpsVisible) {
                    targetRect = fps.getBoundingClientRect();
                } else {
                    targetRect = header.getBoundingClientRect();
                }

                cpsHud.style.top = `${targetRect.top}px`;
                cpsHud.style.left = `${targetRect.right + 5}px`;
                cpsHud.style.height = `${header.offsetHeight}px`;
                const headerStyle = window.getComputedStyle(header);
                cpsHud.style.background = headerStyle.backgroundColor;
                cpsHud.style.border = headerStyle.border;
                cpsHud.style.borderRadius = headerStyle.borderRadius;
                cpsHud.style.width = 'auto';
                cpsHud.style.width = `${cpsHud.offsetWidth + 10}px`;
            };

            setInterval(() => {
                clicksTextSpan.innerText = `${leftClicks} │ ${rightClicks}`;
                leftClicks = 0;
                rightClicks = 0;
            }, 1000);

            positionIntervalId = setInterval(updateBoxPosition, 250);
        };

        const stop = () => {
            clearInterval(updateIntervalId);
            clearInterval(positionIntervalId);
            updateIntervalId = positionIntervalId = null;

            if (clickListener) {
                document.removeEventListener("mousedown", clickListener);
                clickListener = null;
            }

            if (cpsHud) {
                cpsHud.remove();
                cpsHud = null;
            }

            leftClicks = 0;
            rightClicks = 0;
        };

        return {
            start,
            stop
        };
    })();

    //PING COUNTER MODULE (this is not ai bruh its just so its more clean)
    const pingModule = (function () {
        let pingHud = null;
        let msTextSpan = null;
        let pingUpdateIntervalId = null;
        let textUpdateIntervalId = null;
        let positionIntervalId = null;
        let ping = 0;

        const start = () => {
            if (pingHud) return;
            pingHud = document.createElement("div");
            pingHud.style.position = "fixed";
            pingHud.style.color = "#fff";
            pingHud.style.display = 'none';
            pingHud.style.alignItems = 'center';
            pingHud.style.justifyContent = 'center';
            pingHud.style.fontWeight = '500';
            pingHud.style.zIndex = '0.5';
            const pingTextSpan = document.createElement("span");
            pingTextSpan.style.color = "#cfcfcf";
            pingTextSpan.innerText = "PING ";
            pingTextSpan.style.marginRight = '5px';
            msTextSpan = document.createElement("span");
            msTextSpan.style.color = "#fff";
            msTextSpan.innerText = "--ms";
            pingHud.appendChild(pingTextSpan);
            pingHud.appendChild(msTextSpan);
            ClientHud.appendChild(pingHud);

            const updatePing = () => {
                const startTime = Date.now();
                fetch(window.location.origin, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
                    .then(() => {
                    ping = Date.now() - startTime;
                })
                    .catch(() => {
                    ping = -1;
                });
            };
            const updateBoxPosition = () => {
                if (!pingHud) return;

                const header = document.querySelector('.InGameHeader');
                if (!header || header.offsetHeight === 0) {
                    pingHud.style.display = 'none';
                    return;
                }
                pingHud.style.display = 'flex';

                const fps = document.querySelector('.FpsWrapperDiv');
                const coords = document.querySelectorAll('.CoordinateUI');
                const cpsElement = document.getElementById('cpsDisplay');

                const fpsVisible = fps && window.getComputedStyle(fps).display !== 'none';
                const visibleCoords = Array.from(coords).filter(c => window.getComputedStyle(c).display !== 'none');
                const cpsVisible = cpsElement && window.getComputedStyle(cpsElement).display !== 'none';

                let targetRect = null;

                if (cpsVisible) {
                    targetRect = cpsElement.getBoundingClientRect();
                } else if (visibleCoords.length > 0) {
                    targetRect = visibleCoords.reduce((rightmost, c) => {
                        const rect = c.getBoundingClientRect();
                        return !rightmost || rect.right > rightmost.right ? rect : rightmost;
                    }, null);
                } else if (fpsVisible) {
                    targetRect = fps.getBoundingClientRect();
                } else {
                    targetRect = header.getBoundingClientRect();
                }

                pingHud.style.top = `${targetRect.top}px`;
                pingHud.style.left = `${targetRect.right + 5}px`;
                pingHud.style.height = `${header.offsetHeight}px`;

                const headerStyle = window.getComputedStyle(header);
                pingHud.style.background = headerStyle.backgroundColor;
                pingHud.style.border = headerStyle.border;
                pingHud.style.borderRadius = headerStyle.borderRadius;
                pingHud.style.width = 'auto';
                pingHud.style.width = `${pingHud.offsetWidth + 10}px`;
            };

            textUpdateIntervalId = setInterval(() => {
                if (msTextSpan) {
                    msTextSpan.innerText = ping >= 0 ? `${ping}ms` : "--";
                }
            }, 1000);
            pingUpdateIntervalId = setInterval(updatePing, 2500);
            positionIntervalId = setInterval(updateBoxPosition, 300);
            updatePing();
            updateBoxPosition();
        };

        const stop = () => {
            clearInterval(pingUpdateIntervalId);
            clearInterval(textUpdateIntervalId);
            clearInterval(positionIntervalId);
            pingUpdateIntervalId = textUpdateIntervalId = positionIntervalId = null;
            if (pingHud) {
                pingHud.remove();
                pingHud = null;
            }

            msTextSpan = null;
            ping = 0;
        };

        return {
            start,
            stop
        };

    })();
})();
