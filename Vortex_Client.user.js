// ==UserScript==
// @name         Vortex Client
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Vortex Client for Bloxd.io
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
    const settingsStorageKey = 'vortexClientModuleSettings';

    //MODULES (this is not ai bruh its just so its more clean)
    const modules = {
        'Combat': [
            {
                name: 'Keystrokes', description: 'Displays movement keys\nand clicks on screen.', hasSettings: true, enabled: true,
                onEnable: () => { console.log("Keystrokes enabled"); },
                onDisable: () => { console.log("Keystrokes disabled"); },
                settings: [
                    { id: 'keystrokes_scale', label: 'Scale', type: 'slider', min: 0.5, max: 2, step: 0.1, defaultValue: 1.0 },
                    { id: 'keystrokes_color', label: 'Text Color', type: 'color', defaultValue: '#ffffff' },
                    { id: 'keystrokes_showcps', label: 'Show CPS', type: 'toggle', defaultValue: true }
                ]
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
                onEnable: () => { armorDisplayModule.start() },
                onDisable: () => { armorDisplayModule.stop() },
                settings: [
                    { id: 'armourview_scale', label: 'Scale', type: 'slider', min: 0.5, max: 2.0, step: 0.1, defaultValue: 1.0 },
                    { id: 'armourview_orientation', label: 'Orientation', type: 'dropdown', options: ['Horizontal', 'Vertical'], defaultValue: 'Horizontal' }
                ]
            },
            {
                name: 'Cps Counter', description: 'Displays your clicks per\nsecond (CPS).', enabled: true,
                onEnable: () => { cpsModule.start() },
                onDisable: () => { cpsModule.stop() }
            },
            {
                name: 'Ping Counter', description: 'Shows your current ping\nto the server.', enabled: false,
                onEnable: () => { pingModule.start() },
                onDisable: () => { pingModule.stop() }
            },
        ],
        'Player': [],
        'Utility': [
            {
                name: 'Resolution Adjuster', description: 'Change game resolution\nwithout restarting.', hasSettings: true, enabled: false,
                onEnable: () => { },
                onDisable: () => { },
                settings: [
                    { id: 'resolution_preset', label: 'Preset', type: 'dropdown', options: ['10%', '20%', '30%', '40%','60%', '70%', '80%', '90%', '100%'], defaultValue: '100%' }
                ]
            },
            {
                name: 'Notifications', description: 'Show alerts for events\nand key actions.', enabled: true,
                onEnable: () => console.log("Notifications enabled"),
                onDisable: () => console.log("Notifications disabled")
            },
            {
                name: 'Cinematic Mode', description: 'Smooth camera motion\nfor cinematic use.', hasSettings: true, enabled: false,
                onEnable: () => console.log("Cinematic Mode enabled"),
                onDisable: () => console.log("Cinematic Mode disabled"),
                settings: [
                    { id: 'cinematic_smoothness', label: 'Smoothness', type: 'slider', min: 1, max: 10, step: 1, defaultValue: 5 }
                ]
            },
        ],
        'Cosmetics': [
            {
                name: 'Nametags', description: 'Customize appearance\nof player nametags.', hasSettings: true, enabled: false,
                onEnable: () => nametagsModule.start(),
                onDisable: () => nametagsModule.stop(),
                settings: [
                    { id: 'nametags_custom_ui', type: 'custom' }
                ]
            },
            {
                name: 'Custom Cape', description: 'Equip and display your\npersonalized cape.', hasSettings: true, enabled: true,
                onEnable: () => console.log("Custom Cape enabled"),
                onDisable: () => console.log("Custom Cape disabled"),
                settings: [
                    { id: 'customcape_url', label: 'Cape URL', type: 'text', placeholder: 'Enter image URL...', defaultValue: '' }
                ]
            },
        ],
        'Settings': [
            {
                name: 'Client Theme', description: 'Change the look and\nfeel of the client UI.', hasSettings: true, enabled: false,
                onEnable: () => console.log("Theme settings enabled"),
                onDisable: () => console.log("Theme settings disabled"),
                settings: [
                    { id: 'theme_color', label: 'Accent Color', type: 'color', defaultValue: '#6E2828' }
                ]
            },
        ]
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
        document.querySelectorAll(".AdBannerContainer").forEach(adHolder => { adHolder.remove(); });
    }

    function inGame() {
        ClientHud.style.display = 'block';
        document.querySelectorAll(".AdBannerContainer").forEach(adHolder => { adHolder.remove(); });


        const GameHeader = document.querySelector('.InGameHeader');
        GameHeader.style.backgroundColor = 'rgba(30, 33, 41 ,0.85)';
        GameHeader.style.padding = '23px 5px';
        GameHeader.style.borderRadius = '9px';

        function makeMessagesTransparent() {
            document.querySelectorAll('.MessageWrapper').forEach(msg => {
                msg.style.backgroundColor = 'transparent';
            });
        }
        makeMessagesTransparent();
        const chatContainer = document.querySelector('.Chat');
        if (chatContainer) {
            const observer = new MutationObserver(() => {
                makeMessagesTransparent();
            });

            observer.observe(chatContainer, { childList: true, subtree: true });
        }


        const InGameChat = document.querySelector('.Chat');
        InGameChat.style.backgroundColor = 'rgba(30, 33, 41 ,0.85)';
        InGameChat.style.borderRadius = '9px';
        InGameChat.style.maxHeight = '350px';
        InGameChat.style.width = '400px';
        InGameChat.style.maxWidth = '400px';
        InGameChat.style.padding = '10px 0px';

        if (GameHeader && InGameChat) {
            const headerRect = GameHeader.getBoundingClientRect();
            InGameChat.style.position = "absolute";
            InGameChat.style.top = `${headerRect.bottom + 5 + window.scrollY}px`;
        }

        if (!document.querySelector('.VortexInGameLogo')) {
            const InGameLogoHolder = document.createElement('div');
            InGameLogoHolder.classList.add('VortexInGameLogo');
            InGameLogoHolder.style.display = 'flex';
            InGameLogoHolder.style.alignItems = 'center';
            InGameLogoHolder.style.marginRight = '0px';

            const VortexInGameLogo = document.createElement('div');
            VortexInGameLogo.style.backgroundImage = 'url(https://i.postimg.cc/WpkLShLM/Vortex-Client-Logo-Bigger.png)';
            VortexInGameLogo.style.backgroundRepeat = 'no-repeat';
            VortexInGameLogo.style.backgroundSize = 'contain';
            VortexInGameLogo.style.backgroundPosition = 'center';
            VortexInGameLogo.style.color = '#fff';
            VortexInGameLogo.style.width = '2em';
            VortexInGameLogo.style.height = '1.5em';
            VortexInGameLogo.style.display = 'flex';
            VortexInGameLogo.style.alignItems = 'center';
            VortexInGameLogo.style.justifyContent = 'center';
            VortexInGameLogo.style.margin = '0 0 0 3px';

            const text = document.createElement('span');
            text.textContent = 'ortex';
            text.style.fontSize = '1.1em';
            text.style.fontWeight = 'bolder';
            text.style.color = '#fff';
            text.style.display = 'flex';
            text.style.alignItems = 'center';
            text.style.marginLeft = '-10px';
            text.style.marginTop = '-2px';

            InGameLogoHolder.appendChild(VortexInGameLogo);
            InGameLogoHolder.appendChild(text);

            GameHeader.prepend(InGameLogoHolder);

        }

        ['LikeButton' ,'InGameHeaderLogo' , 'InGameHeaderSpacer'].forEach(className => {
            document.querySelectorAll('.' + className).forEach(Hidden => {
                Hidden.style.display = 'none';
                Hidden.style.opacity = '0';
            });
        });

        const LobbyName = document.querySelector('.InGameHeaderLobbyName');
        if (LobbyName) {
            LobbyName.style.color = 'gray';
            LobbyName.style.borderRadius = '8px';
        }

        ['FpsWrapperDiv' ,'CoordinateUI'].forEach(className => {
            document.querySelectorAll('.' + className).forEach(headerbox => {
                headerbox.style.backgroundColor = 'rgba(30, 33, 41 ,0.85)';
                headerbox.style.borderRadius = '9px';
                headerbox.style.paddingTop = '23px';
                headerbox.style.paddingBottom = '23px';
            });
        });

        ['FpsCanvas' ,'CoordinateCanvas'].forEach(className => {
            document.querySelectorAll('.' + className).forEach(canvasstyle => {
                canvasstyle.style.height = '14px';
            });
        });

    }
    function checkState() {
        const homePage = document.querySelector(".HomePage");
        if (homePage && window.getComputedStyle(homePage).display !== "none") {
            if (!menuInterval) { menuInterval = setInterval(inMenu, 1000); }
            if (gameInterval) { clearInterval(gameInterval); gameInterval = null; }
        } else {
            if (!gameInterval) { gameInterval = setInterval(inGame, 1000); }
            if (menuInterval) { clearInterval(menuInterval); menuInterval = null; }
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
    let currentTabName = tabs[0].name;
    let currentTabDescription = tabs[0].description;

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
        tabBtn.addEventListener('mouseover', () => { if (!tabBtn.classList.contains('active')) { tabBtn.style.border = '1px solid rgba(255, 255, 255, 0.1)'; tabBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; tabBtn.style.color = 'rgba(255, 255, 255, 0.6)'; } });
        tabBtn.addEventListener('mouseout', () => { if (!tabBtn.classList.contains('active')) { tabBtn.style.border = 'none'; tabBtn.style.backgroundColor = 'transparent'; tabBtn.style.color = 'rgba(255, 255, 255, 0.35)'; } });
        tabBtn.addEventListener('click', () => {
            tabButtons.forEach(btn => { btn.classList.remove('active'); btn.style.backgroundColor = 'transparent'; btn.style.border = 'none'; btn.style.boxShadow = 'none'; btn.style.color = 'rgba(255, 255, 255, 0.35)'; });
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

    const footerButtons = [{ name: 'Settings', icon: 'ri-settings-5-fill' }, { name: 'Exit', icon: 'ri-logout-box-r-fill' }];
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
        fBtn.addEventListener('mouseover', () => { if (!fBtn.classList.contains('active')) { fBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; fBtn.style.color = 'rgba(255, 255, 255, 0.6)'; fBtn.style.border = '1px solid rgba(255, 255, 255, 0.1)'; } });
        fBtn.addEventListener('mouseout', () => { if (!fBtn.classList.contains('active')) { fBtn.style.backgroundColor = 'transparent'; fBtn.style.color = 'rgba(255, 255, 255, 0.35)'; fBtn.style.border = 'none'; } });
        if (footer.name === 'Exit') { fBtn.addEventListener('click', () => { mainMenuCon.style.display = 'none'; menu.style.display = 'flex'; }); }
        else if (footer.name === 'Settings') {
            fBtn.addEventListener('click', () => {
                tabButtons.forEach(btn => { btn.classList.remove('active'); btn.style.backgroundColor = 'transparent'; btn.style.border = 'none'; btn.style.boxShadow = 'none'; btn.style.color = 'rgba(255, 255, 255, 0.35)'; });
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
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        const textWrapper = document.createElement('div');
        const name = document.createElement('div');
        name.textContent = moduleName;
        name.style.marginTop = '10px';
        name.style.fontSize = '16px';
        name.style.fontWeight = 'bold';
        name.style.color = 'white';
        textWrapper.appendChild(name);
        const desc = document.createElement('div');
        desc.textContent = descriptionText;
        desc.style.fontSize = '12px';
        desc.style.color = 'rgba(255, 255, 255, 0.6)';
        desc.style.marginTop = '5px';
        textWrapper.appendChild(desc);
        card.appendChild(textWrapper);
        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.justifyContent = 'center';
        controls.style.alignItems = 'center';
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
                const module = getModuleByName(moduleName);
                if (module) { showSettingsPanel(module); }
            });
            settingsBtn.addEventListener('mouseover', () => { settingsBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; });
            settingsBtn.addEventListener('mouseout', () => { settingsBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; });
            controls.appendChild(settingsBtn);
        }
        card.appendChild(controls);
        card.addEventListener('mouseover', () => { card.style.transform = 'translateY(-5px) scale(1.02)'; });
        card.addEventListener('mouseout', () => { card.style.transform = 'translateY(0) scale(1)'; });
        return card;
    }

    function showSettingsPanel(module) {
        contentArea.innerHTML = '';
        contentArea.style.display = 'flex';
        contentArea.style.flexDirection = 'column';
        contentArea.style.alignItems = 'flex-start';

        const headerContainer = document.createElement('div');
        headerContainer.style.display = 'flex';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.width = '100%';
        headerContainer.style.marginBottom = '15px';
        contentArea.appendChild(headerContainer);

        const backButton = document.createElement('button');
        backButton.innerHTML = `<i class="ri-arrow-left-line"></i>`;
        backButton.style.fontSize = '20px';
        backButton.style.color = 'white';
        backButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        backButton.style.border = '1px solid rgba(255, 255, 255, 0.15)';
        backButton.style.borderRadius = '8px';
        backButton.style.width = '40px';
        backButton.style.height = '40px';
        backButton.style.cursor = 'pointer';
        backButton.style.marginRight = '15px';
        backButton.style.transition = 'background-color 0.3s ease';
        backButton.style.display = 'flex';
        backButton.style.alignItems = 'center';
        backButton.style.justifyContent = 'center';
        backButton.addEventListener('mouseover', () => { backButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; });
        backButton.addEventListener('mouseout', () => { backButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; });
        backButton.addEventListener('click', () => { setContent(currentTabName, currentTabDescription); });
        headerContainer.appendChild(backButton);

        const title = document.createElement('div');
        title.textContent = `${module.name} Settings`;
        title.style.fontSize = '22px';
        title.style.fontWeight = 'bold';
        headerContainer.appendChild(title);

        const separator = document.createElement('div');
        separator.style.width = '100%';
        separator.style.height = '1px';
        separator.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
        separator.style.marginBottom = '20px';
        contentArea.appendChild(separator);

        if (module.name === 'Nametags') {
            const settingsContentArea = document.createElement('div');
            settingsContentArea.style.width = '100%';
            settingsContentArea.style.height = 'calc(100% - 100px)';
            settingsContentArea.style.overflowY = 'auto';
            settingsContentArea.style.display = 'flex';
            settingsContentArea.style.flexDirection = 'column';
            settingsContentArea.style.gap = '20px';
            contentArea.appendChild(settingsContentArea);

            const nameWrapper = document.createElement('div');
            nameWrapper.style.fontSize = '16px';
            nameWrapper.style.padding = '10px';
            nameWrapper.style.backgroundColor = 'rgba(0,0,0,0.2)';
            nameWrapper.style.borderRadius = '8px';

            const nameLabel = document.createElement('span');
            nameLabel.textContent = 'Bloxd Username: ';
            nameLabel.style.color = 'rgba(255,255,255,0.7)';

            const nameValue = document.createElement('span');
            nameValue.id = 'vortex_nametag_username';
            nameValue.textContent = nametagsModule.getUsername() || 'loading...';
            nameValue.style.fontWeight = 'bold';
            nameValue.style.color = 'white';

            nameWrapper.appendChild(nameLabel);
            nameWrapper.appendChild(nameValue);
            settingsContentArea.appendChild(nameWrapper);

            const gridTitle = document.createElement('div');
            gridTitle.textContent = 'Select a Nametag Image';
            gridTitle.style.fontSize = '18px';
            gridTitle.style.fontWeight = 'bold';
            gridTitle.style.marginTop = '10px';
            settingsContentArea.appendChild(gridTitle);

            const imageGrid = document.createElement('div');
            imageGrid.style.display = 'grid';
            imageGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
            imageGrid.style.gap = '15px';
            imageGrid.style.marginTop = '10px';
            settingsContentArea.appendChild(imageGrid);

            const nametagImageUrls = [
                'https://i.postimg.cc/NMG91FWH/space-BG-loco.jpg',
                'https://i.postimg.cc/1XzTTzhW/galaxy.png',
                'https://i.postimg.cc/NfRTSvBt/custom-moving-skies-1-androidioswin10fps-friendly-5.webp',
                'https://i.postimg.cc/J4Q0jrRs/14896441-xl.webp',
                'https://i.postimg.cc/tC9CqKFp/banner.jpg',
                'https://i.postimg.cc/906dTW28/15220236-xl.webp',
                'https://i.postimg.cc/1RfHnC6F/2023-12-19-11-14-34.png',
                'https://i.postimg.cc/ZKNxjWwK/6843ea27816c80d1186125192cbf582ece88036e-2-690x326.jpg',
                'https://i.postimg.cc/GhjHcr2x/swirling-clouds-create-captivating-natural-vortex-sky-138943-2179.avif',
                'https://i.postimg.cc/bwb6mgmr/1.webp'
            ];

            nametagImageUrls.forEach(url => {
                const imgContainer = document.createElement('div');
                imgContainer.style.cursor = 'pointer';
                imgContainer.style.border = '2px solid transparent';
                imgContainer.style.borderRadius = '8px';
                imgContainer.style.transition = 'all 0.2s ease';
                imgContainer.style.padding = '4px';
                imgContainer.style.backgroundColor = 'rgba(255,255,255,0.05)';
                const img = document.createElement('img');
                img.src = url;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.display = 'block';
                img.style.borderRadius = '6px';
                img.style.objectFit = 'cover';
                imgContainer.appendChild(img);
                imgContainer.addEventListener('mouseover', () => { imgContainer.style.borderColor = 'rgba(110, 40, 40, 0.8)'; imgContainer.style.transform = 'scale(1.05)'; });
                imgContainer.addEventListener('mouseout', () => { imgContainer.style.borderColor = 'transparent'; imgContainer.style.transform = 'scale(1.0)'; });
                imgContainer.addEventListener('click', () => {
                    nametagsModule.setNametag(url);
                    document.querySelectorAll('.nametag-img-container').forEach(c => c.style.borderColor = 'transparent');
                    imgContainer.style.borderColor = 'rgb(110, 40, 40)';
                });
                imgContainer.className = 'nametag-img-container';
                imageGrid.appendChild(imgContainer);
            });
            return;
        }

        const settingsContentArea = document.createElement('div');
        settingsContentArea.style.width = '100%';
        settingsContentArea.style.display = 'flex';
        settingsContentArea.style.flexDirection = 'column';
        settingsContentArea.style.gap = '20px';
        contentArea.appendChild(settingsContentArea);

        if (!module.settings || module.settings.length === 0) {
            settingsContentArea.textContent = 'No configurable settings are available for this module.';
            settingsContentArea.style.color = 'rgba(255, 255, 255, 0.5)';
            settingsContentArea.style.fontSize = '14px';
            return;
        }

        const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey)) || {};

        function saveSetting(id, value) {
            savedSettings[id] = value;
            localStorage.setItem(settingsStorageKey, JSON.stringify(savedSettings));
            console.log(`Saved setting: ${id} = ${value}`);
        }

        module.settings.forEach(setting => {
            const value = savedSettings[setting.id] !== undefined ? savedSettings[setting.id] : setting.defaultValue;
            const settingWrapper = document.createElement('div');
            settingWrapper.style.display = 'flex';
            settingWrapper.style.justifyContent = 'space-between';
            settingWrapper.style.alignItems = 'center';
            settingWrapper.style.width = '100%';

            const label = document.createElement('label');
            label.textContent = setting.label;
            label.style.fontSize = '16px';
            settingWrapper.appendChild(label);

            switch (setting.type) {
                case 'slider': {
                    const controlWrapper = document.createElement('div');
                    controlWrapper.style.display = 'flex';
                    controlWrapper.style.alignItems = 'center';
                    controlWrapper.style.gap = '10px';
                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.min = setting.min;
                    slider.max = setting.max;
                    slider.step = setting.step;
                    slider.value = value;
                    const valueLabel = document.createElement('span');
                    valueLabel.textContent = parseFloat(value).toFixed(1);
                    valueLabel.style.minWidth = '30px';
                    slider.addEventListener('input', () => {
                        valueLabel.textContent = parseFloat(slider.value).toFixed(1);
                        saveSetting(setting.id, parseFloat(slider.value));
                    });
                    controlWrapper.appendChild(slider);
                    controlWrapper.appendChild(valueLabel);
                    settingWrapper.appendChild(controlWrapper);
                    break;
                }
                case 'toggle': {
                    const switchLabel = document.createElement('label');
                    switchLabel.style.position = 'relative';
                    switchLabel.style.display = 'inline-block';
                    switchLabel.style.width = '54px';
                    switchLabel.style.height = '28px';
                    const switchInput = document.createElement('input');
                    switchInput.type = 'checkbox';
                    switchInput.style.opacity = '0';
                    switchInput.style.width = '0';
                    switchInput.style.height = '0';
                    const sliderSpan = document.createElement('span');
                    sliderSpan.style.position = 'absolute';
                    sliderSpan.style.cursor = 'pointer';
                    sliderSpan.style.top = '0';
                    sliderSpan.style.left = '0';
                    sliderSpan.style.right = '0';
                    sliderSpan.style.bottom = '0';
                    sliderSpan.style.transition = '.4s';
                    sliderSpan.style.borderRadius = '34px';
                    const sliderKnob = document.createElement('span');
                    sliderKnob.style.position = 'absolute';
                    sliderKnob.style.height = '20px';
                    sliderKnob.style.width = '20px';
                    sliderKnob.style.left = '4px';
                    sliderKnob.style.bottom = '4px';
                    sliderKnob.style.backgroundColor = 'white';
                    sliderKnob.style.transition = '.4s';
                    sliderKnob.style.borderRadius = '50%';

                    function updateToggle(checked) {
                        if (checked) {
                            sliderSpan.style.backgroundColor = 'rgba(110, 40, 40, 0.8)';
                            sliderKnob.style.transform = 'translateX(26px)';
                        } else {
                            sliderSpan.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            sliderKnob.style.transform = 'translateX(0)';
                        }
                    }
                    switchInput.checked = value;
                    updateToggle(value);
                    switchInput.addEventListener('change', () => {
                        updateToggle(switchInput.checked);
                        saveSetting(setting.id, switchInput.checked);
                    });
                    sliderSpan.appendChild(sliderKnob);
                    switchLabel.appendChild(switchInput);
                    switchLabel.appendChild(sliderSpan);
                    settingWrapper.appendChild(switchLabel);
                    break;
                }
                case 'color': {
                    const colorInput = document.createElement('input');
                    colorInput.type = 'color';
                    colorInput.value = value;
                    colorInput.style.border = 'none';
                    colorInput.style.background = 'none';
                    colorInput.style.width = '40px';
                    colorInput.style.height = '40px';
                    colorInput.addEventListener('input', () => {
                        saveSetting(setting.id, colorInput.value);
                    });
                    settingWrapper.appendChild(colorInput);
                    break;
                }
                case 'dropdown': {
                    const select = document.createElement('select');
                    select.id = setting.id;
                    select.style.backgroundColor = 'rgba(0,0,0,0.3)';
                    select.style.color = 'white';
                    select.style.border = '1px solid rgba(255,255,255,0.1)';
                    select.style.borderRadius = '5px';
                    select.style.padding = '5px';
                    setting.options.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt;
                        select.appendChild(option);
                    });
                    select.value = value;
                    select.addEventListener('change', () => {
                        saveSetting(setting.id, select.value);
                    });
                    settingWrapper.appendChild(select);
                    break;
                }
                case 'text': {
                    const textInput = document.createElement('input');
                    textInput.type = 'text';
                    textInput.placeholder = setting.placeholder;
                    textInput.value = value;
                    textInput.style.backgroundColor = 'rgba(0,0,0,0.3)';
                    textInput.style.color = 'white';
                    textInput.style.border = '1px solid rgba(255,255,255,0.1)';
                    textInput.style.borderRadius = '5px';
                    textInput.style.padding = '8px';
                    textInput.style.textAlign = 'right';
                    textInput.addEventListener('change', () => {
                        saveSetting(setting.id, textInput.value);
                    });
                    settingWrapper.appendChild(textInput);
                    break;
                }
            }
            settingsContentArea.appendChild(settingWrapper);
        });
    }

    function setContent(tabName, tabDescription) {
        currentTabName = tabName;
        currentTabDescription = tabDescription;
        contentArea.innerHTML = '';
        contentArea.style.position = 'relative';
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
        gridContainer.style.maxHeight = 'calc(100% - 100px)';
        gridContainer.style.overflowY = 'auto';
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
        btn.addEventListener('mouseover', function () { btn.style.transition = 'background-image 0.3s ease, box-shadow 0.3s ease'; btn.style.backgroundImage = 'linear-gradient(45deg, rgba(110, 40, 40, 1) 40%, rgba(124, 54, 59, 1) 100%)'; btn.style.boxShadow = '0px 0px 29px 0px rgb(110, 40, 40)'; });
        btn.addEventListener('mouseout', function () { btn.style.transition = 'none'; btn.style.backgroundImage = 'linear-gradient(45deg, rgba(0, 4, 9, 1) 40%, rgba(14, 14, 19, 1) 100%)'; btn.style.boxShadow = 'none'; });
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

    const VortexSettingsBtn = createStyledButton({ width: '250px', height: '60px', fontSize: '16px', text: 'Vortex Settings' });
    VortexSettingsBtn.style.marginTop = '120px';
    VortexSettingsBtn.addEventListener('click', function () { mainMenuCon.style.display = 'flex'; menu.style.display = 'none'; gameui.style.display = ''; });
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

    const icons = ['ri-pencil-fill', 'ri-group-fill', 'ri-magic-fill', 'ri-settings-5-fill'];
    icons.forEach(icon => {
        const btn = createStyledButton({ html: `<i class="${icon}"></i>` });
        VortexMenuBtnDiv.appendChild(btn);
        if (icon === 'ri-pencil-fill') {
            btn.addEventListener('click', startHudEditMode);
        }
    });

    let hudEditOverlay = null;
    function startHudEditMode() {
        if (hudEditOverlay && hudEditOverlay.style.display === 'flex') return;
        hud.style.backgroundColor = 'transparent';
        hud.style.backdropFilter = 'blur(0px)';
        gameui.style.filter = 'grayscale(0%) brightness(1)';
        menu.style.display = 'none';
        hud.style.pointerEvents = 'none';
        if (!hudEditOverlay) {
            hudEditOverlay = document.createElement('div');
            Object.assign(hudEditOverlay.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: '999998', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '30px', pointerEvents: 'none' });
            const doneButton = document.createElement('button');
            doneButton.textContent = 'Done';
            Object.assign(doneButton.style, { padding: '12px 25px', fontSize: '18px', cursor: 'pointer', color: 'white', boxShadow : '0px 0px 15px 0px rgb(20, 20, 20)', border: '1px solid rgba(125, 125, 125, 0.5)', borderRadius: '8px', backgroundColor: 'rgb(20, 20, 20)', transition: 'transform 0.2s ease', pointerEvents: 'auto' });
            doneButton.addEventListener('mouseover', () => doneButton.style.transform = 'scale(1.05)');
            doneButton.addEventListener('mouseout', () => doneButton.style.transform = 'scale(1.0)');
            doneButton.addEventListener('click', endHudEditMode);
            hudEditOverlay.appendChild(doneButton);
            document.body.appendChild(hudEditOverlay);
        }
        hudEditOverlay.style.display = 'flex';
        if (typeof armorDisplayModule.setEditable === 'function') armorDisplayModule.setEditable(true);
    }
    function endHudEditMode() {
        if (hudEditOverlay) hudEditOverlay.style.display = 'none';
        menu.style.display = 'flex';
        hud.style.pointerEvents = 'auto';
        hud.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        hud.style.backdropFilter = 'blur(5px)';
        gameui.style.filter = 'grayscale(80%) brightness(0.6))';
        if (typeof armorDisplayModule.setEditable === 'function') armorDisplayModule.setEditable(false);
    }

    let menuVisible = true;
    const toggleMenuKey = 'ShiftRight';
    window.addEventListener('keydown', function (e) {
        if (e.code === toggleMenuKey) {
            if (hudEditOverlay && hudEditOverlay.style.display === 'flex') {endHudEditMode();return;}
            menuVisible = !menuVisible;
            menu.style.display = menuVisible ? 'flex' : 'none';
            hud.style.backgroundColor = menuVisible ? 'rgba(0, 0, 0, 0.8)' : 'transparent';
            hud.style.backdropFilter = menuVisible ? 'blur(5px)' : 'blur(0px)';
            hud.style.pointerEvents = menuVisible ? 'auto' : 'none';
            mainMenuCon.style.display = 'none';
            gameui.style.display = 'block';
            gameui.style.filter = menuVisible ? 'grayscale(80%) brightness(0.6)' : 'grayscale(0%) brightness(1)';
            if (menuVisible && document.pointerLockElement) { document.exitPointerLock(); }
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

    // ARMOUR VIEW  MODULE (this is not ai bruh its just so its more clean)
    const armorDisplayModule = (function() {
        const ARMOR_IMG_URL = 'https://i.postimg.cc/5t7RH0NN/Untitledyjffggggg.png';
        const ARMOR_INDEXES = [46, 47, 48, 49, 50];
        const POSITION_STORAGE_KEY = 'armorDisplayPosition';
        let displayBox = null;
        let overrideStyleSheet = null;
        let updateIntervalId = null;
        let isEditable = false;
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        const setStyles = (element, styles) => {
            Object.assign(element.style, styles);
        };

        const getSettings = () => {
            const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey)) || {};
            return {
                scale: savedSettings.armourview_scale !== undefined ? savedSettings.armourview_scale : 1.0,
                orientation: savedSettings.armourview_orientation || 'Horizontal'
            };
        };

        const savePosition = () => {
            if (!displayBox) return;
            const position = { top: displayBox.style.top, left: displayBox.style.left };
            localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
        };

        const loadPosition = () => {
            const savedPosition = localStorage.getItem(POSITION_STORAGE_KEY);
            return savedPosition ? JSON.parse(savedPosition) : null;
        };

        const onMouseDown = (e) => {
            if (!isEditable || e.button !== 0) return;
            isDragging = true;
            e.preventDefault();
            const rect = displayBox.getBoundingClientRect();
            setStyles(displayBox, {
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                bottom: 'auto',
                right: 'auto',
                transformOrigin: 'top left'
            });

            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            displayBox.style.cursor = 'move';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            let newLeft = e.clientX - dragOffsetX;
            let newTop = e.clientY - dragOffsetY;
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - displayBox.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - displayBox.offsetHeight));
            displayBox.style.left = `${newLeft}px`;
            displayBox.style.top = `${newTop}px`;
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            displayBox.style.cursor = 'grab';
            savePosition();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        const setEditable = (editable) => {
            isEditable = editable;
            if (!displayBox) return;
            if (editable) {
                setStyles(displayBox, {cursor: 'grab', border: '2px dashed rgba(255, 255, 255, 0.7)', pointerEvents: 'auto'});
                displayBox.addEventListener('mousedown', onMouseDown);
            } else {
                setStyles(displayBox, {cursor: 'default', border: 'none', pointerEvents: 'none'});
                displayBox.removeEventListener('mousedown', onMouseDown);
                if (isDragging) onMouseUp();
            }
        };

        const injectOverrideCSS = () => {
            if (overrideStyleSheet) return;
            overrideStyleSheet = document.createElement('style');
            overrideStyleSheet.innerHTML = `
                .InvenItem.inven-item-clone {
                    background: none !important;
                    background-color: transparent !important;
                    border: none !important;
                    outline: none !important;
                    background-image: none !important;
                }
            `;
            document.head.appendChild(overrideStyleSheet);
        };

        const createDisplayBox = () => {
            displayBox = document.createElement('div');
            const savedPosition = loadPosition();
            const initialStyles = {
                position: 'fixed', zIndex: '9999', display: 'flex', padding: '5px',
                backgroundColor: 'transparent', pointerEvents: 'none'
            };

            if (savedPosition) {
                Object.assign(initialStyles, {
                    top: savedPosition.top,
                    left: savedPosition.left,
                    transformOrigin: 'top left'
                });
            } else {
                Object.assign(initialStyles, {
                    bottom: '20px',
                    right: '20px',
                    transformOrigin: 'bottom right'
                });
            }
            setStyles(displayBox, initialStyles);
            ClientHud.appendChild(displayBox);
        };

        const applyStylesFromSettings = () => {
            if (!displayBox) return;
            const settings = getSettings();

            if (settings.orientation === 'Horizontal') {
                setStyles(displayBox, { flexDirection: 'row', width: 'auto', height: '60px', alignItems: 'center' });
            } else {
                setStyles(displayBox, { flexDirection: 'column', width: '60px', height: 'auto', alignItems: 'center' });
            }
            displayBox.style.transform = `scale(${settings.scale})`;
        };

        const updateItems = () => {
            if (!displayBox) return;
            applyStylesFromSettings();
            displayBox.querySelectorAll('.inven-item-clone').forEach(item => item.remove());
            ARMOR_INDEXES.forEach(idx => {
                const originalItem = document.querySelector(`.InvenItem[data-inven-idx="${idx}"]`);
                if (!originalItem) return;
                const clone = originalItem.cloneNode(true);
                clone.className = 'InvenItem inven-item-clone';
                clone.removeAttribute('id');
                setStyles(clone, { backgroundColor: 'transparent', border: 'none', marginBottom: '-7px', transform: 'scale(1.0)' });
                const unfilledSlot = clone.querySelector('.InvenItemUnfilled');
                if (unfilledSlot) {
                    unfilledSlot.style.backgroundImage = `url("${ARMOR_IMG_URL}")`;
                }
                displayBox.appendChild(clone);
            });
        };

        const start = () => {
            if (displayBox) return;
            injectOverrideCSS();
            createDisplayBox();
            updateItems();
            updateIntervalId = setInterval(updateItems, 500);
        };

        const stop = () => {
            clearInterval(updateIntervalId);
            updateIntervalId = null;
            if (displayBox) {
                displayBox.remove();
                displayBox = null;
            }
            if (overrideStyleSheet) {
                overrideStyleSheet.remove();
                overrideStyleSheet = null;
            }
        };

        return {
            start,
            stop,
            setEditable
        };
    })();

    // NAMETAG MODULE (this is not ai bruh its just so its more clean)
    const nametagsModule = (function() {
        let username = 'unknown';
        let getNameIntervalId = null;
        let originalGetContext = null;
        let db = null;
        let patterns = {};
        let unsubscribeSnapshot = null;

        function GetBloxdName() {
            const playername = document.querySelector(".PlayerNamePreview")?.textContent.trim();
            if (playername && playername !== username) {
                username = playername;
                const nameUIElement = document.getElementById("vortex_nametag_username");
                if (nameUIElement) {
                    nameUIElement.textContent = username;
                }
            }
        }

        function loadFirebaseScripts(callback) {
            if (window.firebase && window.firebase.firestore) {
                return callback();
            }
            const scripts = [
                "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js",
                "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"
            ];
            let loaded = 0;
            scripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    loaded++;
                    if (loaded === scripts.length) callback();
                };
                document.head.appendChild(script);
            });
        }

        function patchCanvas(patterns) {
            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (type, ...args) {
                const ctx = originalGetContext.call(this, type, ...args);
                if (type === '2d') hookCanvas(ctx, patterns);
                return ctx;
            };

            function hookCanvas(ctx, patterns) {
                if (ctx._hooked) return;
                ctx._hooked = true;

                const originalFillText = ctx.fillText;
                ctx.fillText = function (text, x, y, maxWidth) {
                    const isInsideNametagBox = x >= 0 && x <= 800 && y >= 30 && y <= 300;
                    if (typeof text === "string" && text.length > 1 && isInsideNametagBox && patterns[text]) {
                        const cfg = patterns[text];
                        this.save();
                        this.globalCompositeOperation = 'source-over';
                        originalFillText.call(this, text, x, y, maxWidth);

                        const originalFillRect = this.fillRect;
                        this.fillRect = function (x, y, w, h) {
                            const isBoxForNametag = w > 30 && w < 200 && h >= 10 && h <= 25 && y >= 30 && y <= 300;
                            if (isBoxForNametag) return;
                            this.save();
                            this.globalAlpha = 0.8;
                            this.globalCompositeOperation = 'screen';
                            try {
                                if (cfg.img.complete && cfg.img.naturalWidth > 0) {
                                    if (!cfg.pattern) {
                                        cfg.pattern = this.createPattern(cfg.img, 'repeat');
                                    }
                                    this.fillStyle = cfg.pattern;
                                }
                            } catch (e) {}

                            originalFillRect.call(this, x, y, w, h);
                            this.restore();
                        };
                        this.restore();
                    } else {
                        this.save();
                        originalFillText.call(this, text, x, y, maxWidth);
                        this.restore();
                    }
                };
            }
        }

        const start = () => {
            if (originalGetContext) return;
            originalGetContext = HTMLCanvasElement.prototype.getContext;
            loadFirebaseScripts(() => {
                if (firebase.apps.length === 0) {
                    const firebaseConfig = {
                        apiKey: "AIzaSyDmvmcxP55DQ0guGF81rLf5XCpArEr2mQs",
                        authDomain: "vortex-client-database.firebaseapp.com",
                        projectId: "vortex-client-database",
                    };
                    firebase.initializeApp(firebaseConfig);
                }
                db = firebase.firestore();
                unsubscribeSnapshot = db.collection("nametags").onSnapshot((snapshot) => {
                    snapshot.forEach(doc => {
                        const { name, imgUrl } = doc.data();
                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        img.src = imgUrl;
                        patterns[name] = { img, pattern: null };
                    });
                });
                patchCanvas(patterns);
            });
            getNameIntervalId = setInterval(GetBloxdName, 500);
        };

        const stop = () => {
            if (getNameIntervalId) clearInterval(getNameIntervalId);
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            if (originalGetContext) HTMLCanvasElement.prototype.getContext = originalGetContext;
            getNameIntervalId = unsubscribeSnapshot = originalGetContext = db = null;
            patterns = {};
        };

        return {
            start,
            stop,
            setNametag: function(imageUrl) {
                if (!db || username === 'unknown' || !imageUrl) {
                    alert("You have to be in menu to set your nametag");
                    return;
                }
                const name = username;
                db.collection("nametags").doc(name).set({ name, imgUrl: imageUrl })
                    .then(() => { /* Yay it sented */ })
                    .catch(err => {

                });
            },
            getUsername: () => username,
        };
    })();



})();
