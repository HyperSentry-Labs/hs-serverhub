--[[
    hs-serverhub / client.lua
    ------------------------------------------------------------------------
    Owns the only two things the client needs to get right:
      1. NUI focus/cursor state must always match `isOpen`, with no way to
         get stuck (covers keybind, command, ESC, close button, and a
         resource restart mid-session).
      2. Forwarding server content/status pushes into SendNUIMessage without
         ever spamming the NUI on every tick.
]]

local isOpen = false
local resourceName = GetCurrentResourceName()

local function openUI()
    if isOpen then return end
    isOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({ type = 'open' })
    TriggerServerEvent('hs-serverhub:server:viewerOpened')
    TriggerServerEvent('hs-serverhub:server:requestBootstrap')
end

local function closeUI()
    if not isOpen then return end
    isOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ type = 'close' })
    TriggerServerEvent('hs-serverhub:server:viewerClosed')
end

-- ----------------------------------------------------------------------
-- Opening: keybind + chat command
-- ----------------------------------------------------------------------

-- Players can rebind this at any time under Settings > Key Bindings > FiveM.
-- Config.General.DefaultKey only sets the shipped default.
RegisterKeyMapping('hs-serverhub:toggle', 'Toggle ServerHub', 'keyboard', Config.General.DefaultKey)
RegisterCommand('hs-serverhub:toggle', function()
    if isOpen then
        closeUI()
    else
        openUI()
    end
end, false)

-- The chat command (Config.General.Command) is registered server-side in
-- server.lua, which triggers 'hs-serverhub:client:open' back to the
-- requesting player. That keeps command registration in one place and
-- means a future permission check only ever needs to change server.lua.
RegisterNetEvent('hs-serverhub:client:open')
AddEventHandler('hs-serverhub:client:open', function()
    openUI()
end)

-- ----------------------------------------------------------------------
-- Server -> client content/status
-- ----------------------------------------------------------------------

RegisterNetEvent('hs-serverhub:client:bootstrap')
AddEventHandler('hs-serverhub:client:bootstrap', function(content)
    SendNUIMessage({ type = 'bootstrap', payload = content })
end)

RegisterNetEvent('hs-serverhub:client:contentUpdate')
AddEventHandler('hs-serverhub:client:contentUpdate', function(content)
    SendNUIMessage({ type = 'contentUpdate', payload = content })
end)

RegisterNetEvent('hs-serverhub:client:statusUpdate')
AddEventHandler('hs-serverhub:client:statusUpdate', function(status)
    SendNUIMessage({ type = 'statusUpdate', payload = status })
end)

-- ----------------------------------------------------------------------
-- NUI -> client
-- ----------------------------------------------------------------------

RegisterNUICallback('close', function(_, cb)
    closeUI()
    cb({ ok = true })
end)

RegisterNUICallback('refresh', function(_, cb)
    TriggerServerEvent('hs-serverhub:server:requestBootstrap')
    cb({ ok = true })
end)

-- ----------------------------------------------------------------------
-- Safety net: if the NUI's own Escape handler never runs (page failed to
-- load, JS error, dev-mode reload, etc.) this still closes ServerHub and
-- releases input, so the player is never soft-locked.
-- ----------------------------------------------------------------------

CreateThread(function()
    while true do
        if isOpen then
            Wait(0)
            DisableControlAction(0, 1, true)   -- LookLeftRight
            DisableControlAction(0, 2, true)   -- LookUpDown
            DisableControlAction(0, 24, true)  -- Attack
            DisableControlAction(0, 25, true)  -- Aim
            DisableControlAction(0, 106, true) -- VehicleMouseControlOverride
            if IsDisabledControlJustReleased(0, 200) then -- INPUT_FRONTEND_PAUSE (Escape)
                closeUI()
            end
        else
            Wait(250)
        end
    end
end)

AddEventHandler('onResourceStop', function(stoppedResource)
    if stoppedResource ~= resourceName then return end
    if isOpen then
        SetNuiFocus(false, false)
    end
end)
