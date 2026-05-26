; HexBrief NSIS installer
; Coordinates taken directly from MUI2 Welcome.nsh source:
; Dialog: 315u x 193u (full window via FULLWINDOW)
; Sidebar: 0u 0u 109u 193u
; Content starts at: 120u
; Content width: 195u (120 + 195 = 315)

!macro customHeader
!macroend

!macro customWelcomePage
  !insertmacro MUI_PAGE_FUNCTION_FULLWINDOW

  Page custom hb_welcome_show hb_welcome_leave

  Function hb_welcome_show
    Call muiPageLoadFullWindow

    nsDialogs::Create 1044
    Pop $0
    SetCtlColors $0 "" "0x0a0f1e"

    ; Sidebar BMP — exact MUI2 dimensions
    ${NSD_CreateBitmap} 0u 0u 109u 193u ""
    Pop $1
    ${NSD_SetImage} $1 "${MUI_WELCOMEFINISHPAGE_BITMAP}" $2

    ; Red top accent
    ${NSD_CreateLabel} 0u 0u 109u 3u ""
    Pop $1
    SetCtlColors $1 "" "0xe8412a"

    ; Red right edge
    ${NSD_CreateLabel} 107u 0u 2u 193u ""
    Pop $1
    SetCtlColors $1 "" "0xe8412a"

    ; Content background
    ${NSD_CreateLabel} 109u 0u 206u 193u ""
    Pop $1
    SetCtlColors $1 "" "0x0a0f1e"

    ; Header bar
    ${NSD_CreateLabel} 109u 0u 206u 38u ""
    Pop $1
    SetCtlColors $1 "" "0x0f1629"

    ; Red underline
    ${NSD_CreateLabel} 109u 37u 206u 2u ""
    Pop $1
    SetCtlColors $1 "" "0xe8412a"

    ; Title
    ${NSD_CreateLabel} 120u 8u 190u 18u "Welcome to HexBrief"
    Pop $1
    SetCtlColors $1 "0xf0f2f8" "0x0f1629"
    CreateFont $R9 "Segoe UI" 11 700
    SendMessage $1 ${WM_SETFONT} $R9 0

    ; Subtitle
    ${NSD_CreateLabel} 120u 27u 190u 10u "Personal morning dashboard"
    Pop $1
    SetCtlColors $1 "0x6070a8" "0x0f1629"
    CreateFont $R9 "Courier New" 7 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    ; Body
    ${NSD_CreateLabel} 120u 48u 190u 12u "HexBrief is your personal morning dashboard."
    Pop $1
    SetCtlColors $1 "0xf0f2f8" "0x0a0f1e"
    CreateFont $R9 "Segoe UI" 9 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateLabel} 120u 63u 190u 36u "Weather, tasks, headlines and calendar in one place. No accounts. No tracking."
    Pop $1
    SetCtlColors $1 "0x9aa5c8" "0x0a0f1e"
    CreateFont $R9 "Segoe UI" 8 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateLabel} 120u 105u 190u 10u "Click Next to continue."
    Pop $1
    SetCtlColors $1 "0x6070a8" "0x0a0f1e"
    CreateFont $R9 "Segoe UI" 8 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    !insertmacro MUI_PAGE_FUNCTION_CUSTOM SHOW
    nsDialogs::Show
    !insertmacro MUI_PAGE_FUNCTION_CUSTOM DESTROYED
    Call muiPageUnloadFullWindow
  FunctionEnd

  Function hb_welcome_leave
    !insertmacro MUI_PAGE_FUNCTION_CUSTOM LEAVE
  FunctionEnd
!macroend

!macro customFinishPage
  Var hb_launch_check

  !insertmacro MUI_PAGE_FUNCTION_FULLWINDOW

  Page custom hb_finish_show

  Function hb_finish_show
    Call muiPageLoadFullWindow

    nsDialogs::Create 1044
    Pop $0
    SetCtlColors $0 "" "0x0a0f1e"

    ${NSD_CreateBitmap} 0u 0u 109u 193u ""
    Pop $1
    ${NSD_SetImage} $1 "${MUI_WELCOMEFINISHPAGE_BITMAP}" $2

    ${NSD_CreateLabel} 0u 0u 109u 3u ""
    Pop $1
    SetCtlColors $1 "" "0xe8412a"

    ${NSD_CreateLabel} 107u 0u 2u 193u ""
    Pop $1
    SetCtlColors $1 "" "0xe8412a"

    ${NSD_CreateLabel} 109u 0u 206u 193u ""
    Pop $1
    SetCtlColors $1 "" "0x0a0f1e"

    ; Green header for success
    ${NSD_CreateLabel} 109u 0u 206u 38u ""
    Pop $1
    SetCtlColors $1 "" "0x0d1f0d"

    ${NSD_CreateLabel} 109u 37u 206u 2u ""
    Pop $1
    SetCtlColors $1 "" "0x4caf50"

    ${NSD_CreateLabel} 120u 8u 190u 18u "Installation complete"
    Pop $1
    SetCtlColors $1 "0xa5d6a7" "0x0d1f0d"
    CreateFont $R9 "Segoe UI" 11 700
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateLabel} 120u 27u 190u 10u "HexBrief v${VERSION} is ready"
    Pop $1
    SetCtlColors $1 "0x4a7a4a" "0x0d1f0d"
    CreateFont $R9 "Courier New" 7 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateLabel} 120u 48u 190u 12u "Installed successfully."
    Pop $1
    SetCtlColors $1 "0xf0f2f8" "0x0a0f1e"
    CreateFont $R9 "Segoe UI" 9 500
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateLabel} 120u 63u 190u 24u "Open it each morning for your daily brief."
    Pop $1
    SetCtlColors $1 "0x9aa5c8" "0x0a0f1e"
    CreateFont $R9 "Segoe UI" 8 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateCheckbox} 120u 96u 180u 12u "Launch HexBrief now"
    Pop $hb_launch_check
    SetCtlColors $hb_launch_check "0xf0f2f8" "0x0a0f1e"
    ${NSD_SetState} $hb_launch_check ${BST_CHECKED}

    !insertmacro MUI_PAGE_FUNCTION_CUSTOM SHOW
    nsDialogs::Show
    !insertmacro MUI_PAGE_FUNCTION_CUSTOM DESTROYED
    Call muiPageUnloadFullWindow

    ${NSD_GetState} $hb_launch_check $0
    IntCmp $0 ${BST_CHECKED} 0 hb_skip_launch hb_skip_launch
      Exec '"$INSTDIR\HexBrief.exe"'
    hb_skip_launch:
  FunctionEnd
!macroend

!macro customInstall
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
  CreateShortCut "$QUICKLAUNCH\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
!macroend

!macro customUnInstall
  nsProcess::_FindProcess "HexBrief.exe"
  Pop $R0
  ${If} $R0 == 0
    nsProcess::_KillProcess "HexBrief.exe"
    Sleep 1000
  ${EndIf}
  RMDir /r "$APPDATA\HexBrief"
  RMDir /r "$LOCALAPPDATA\HexBrief"
  Delete "$DESKTOP\HexBrief.lnk"
  Delete "$QUICKLAUNCH\HexBrief.lnk"
  Delete "$STARTMENU\Programs\HexBrief\HexBrief.lnk"
  RMDir "$STARTMENU\Programs\HexBrief"
  DeleteRegKey HKCU "Software\HexBrief"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "HexBrief"
!macroend
