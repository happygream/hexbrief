; HexBrief NSIS customisation
; Uses customWelcomePage + customFinishPage hooks from assistedInstaller.nsh
; These are the only two pages we fully brand — electron-builder handles
; directory selection, instfiles progress, and all extraction

; ================================================================
; WELCOME PAGE
; ================================================================
!macro customWelcomePage
  Page custom hb_welcome_show hb_welcome_leave

  Function hb_welcome_show
    nsDialogs::Create 1018
    Pop $0
    SetCtlColors $0 "" "0x0a0f1e"

    ; Sidebar BMP — electron-builder sets MUI_WELCOMEFINISHPAGE_BITMAP
    ${NSD_CreateBitmap} 0 0 164u 314u ""
    Pop $1
    ${NSD_SetImage} $1 "${MUI_WELCOMEFINISHPAGE_BITMAP}" $2

    ; Red top accent
    ${NSD_CreateLabel} 0 0 164u 4u ""
    Pop $1
    SetCtlColors $1 "" "0xe8412a"

    ; Red right edge
    ${NSD_CreateLabel} 161u 0 3u 314u ""
    Pop $1
    SetCtlColors $1 "" "0xe8412a"

    ; Content panel
    ${NSD_CreateLabel} 164u 0 316u 314u ""
    Pop $1
    SetCtlColors $1 "" "0x0a0f1e"

    ; Header bar
    ${NSD_CreateLabel} 164u 0 316u 54u ""
    Pop $1
    SetCtlColors $1 "" "0x0f1629"

    ; Red header underline
    ${NSD_CreateLabel} 164u 52u 316u 3u ""
    Pop $1
    SetCtlColors $1 "" "0xe8412a"

    ; Title
    ${NSD_CreateLabel} 176u 14u 290u 18u "Welcome to HexBrief"
    Pop $1
    SetCtlColors $1 "0xf0f2f8" "0x0f1629"
    CreateFont $R9 "Segoe UI" 12 700
    SendMessage $1 ${WM_SETFONT} $R9 0

    ; Subtitle
    ${NSD_CreateLabel} 176u 35u 290u 13u "Personal morning dashboard installer"
    Pop $1
    SetCtlColors $1 "0x6070a8" "0x0f1629"
    CreateFont $R9 "Courier New" 8 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    ; Body
    ${NSD_CreateLabel} 176u 70u 290u 15u "HexBrief is your personal morning dashboard."
    Pop $1
    SetCtlColors $1 "0xf0f2f8" "0x0a0f1e"
    CreateFont $R9 "Segoe UI" 10 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateLabel} 176u 90u 290u 32u "Weather, tasks, headlines and calendar in one place. No accounts. No tracking. No subscriptions."
    Pop $1
    SetCtlColors $1 "0x9aa5c8" "0x0a0f1e"
    CreateFont $R9 "Segoe UI" 9 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateLabel} 176u 130u 290u 13u "Click Next to continue."
    Pop $1
    SetCtlColors $1 "0x6070a8" "0x0a0f1e"
    CreateFont $R9 "Segoe UI" 9 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    nsDialogs::Show
  FunctionEnd

  Function hb_welcome_leave
  FunctionEnd
!macroend

; ================================================================
; FINISH PAGE
; ================================================================
!macro customFinishPage
  Var hb_launch_check

  Page custom hb_finish_show

  Function hb_finish_show
    nsDialogs::Create 1018
    Pop $0
    SetCtlColors $0 "" "0x0a0f1e"

    ; Sidebar
    ${NSD_CreateBitmap} 0 0 164u 314u ""
    Pop $1
    ${NSD_SetImage} $1 "${MUI_WELCOMEFINISHPAGE_BITMAP}" $2

    ${NSD_CreateLabel} 0 0 164u 4u ""
    Pop $1
    SetCtlColors $1 "" "0xe8412a"

    ${NSD_CreateLabel} 161u 0 3u 314u ""
    Pop $1
    SetCtlColors $1 "" "0xe8412a"

    ${NSD_CreateLabel} 164u 0 316u 314u ""
    Pop $1
    SetCtlColors $1 "" "0x0a0f1e"

    ; Green header for success
    ${NSD_CreateLabel} 164u 0 316u 54u ""
    Pop $1
    SetCtlColors $1 "" "0x0d1f0d"

    ${NSD_CreateLabel} 164u 52u 316u 3u ""
    Pop $1
    SetCtlColors $1 "" "0x4caf50"

    ${NSD_CreateLabel} 176u 14u 290u 18u "Installation complete"
    Pop $1
    SetCtlColors $1 "0xa5d6a7" "0x0d1f0d"
    CreateFont $R9 "Segoe UI" 12 700
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateLabel} 176u 35u 290u 13u "HexBrief v${VERSION} is ready"
    Pop $1
    SetCtlColors $1 "0x4a7a4a" "0x0d1f0d"
    CreateFont $R9 "Courier New" 8 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateLabel} 176u 70u 290u 15u "Installed successfully."
    Pop $1
    SetCtlColors $1 "0xf0f2f8" "0x0a0f1e"
    CreateFont $R9 "Segoe UI" 10 500
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateLabel} 176u 90u 290u 28u "Open it each morning for your daily brief."
    Pop $1
    SetCtlColors $1 "0x9aa5c8" "0x0a0f1e"
    CreateFont $R9 "Segoe UI" 9 400
    SendMessage $1 ${WM_SETFONT} $R9 0

    ${NSD_CreateCheckbox} 178u 128u 280u 14u "Launch HexBrief now"
    Pop $hb_launch_check
    SetCtlColors $hb_launch_check "0xf0f2f8" "0x0a0f1e"
    ${NSD_SetState} $hb_launch_check ${BST_CHECKED}

    nsDialogs::Show

    ${NSD_GetState} $hb_launch_check $0
    IntCmp $0 ${BST_CHECKED} 0 hb_skip_launch hb_skip_launch
      Exec '"$INSTDIR\HexBrief.exe"'
    hb_skip_launch:
  FunctionEnd
!macroend

; ================================================================
; HEADER — hides the stock MUI header image bar on middle pages
; ================================================================
!macro customHeader
  Function .onGUIInit
    GetDlgItem $0 $HWNDPARENT 1028
    ShowWindow $0 0
    GetDlgItem $0 $HWNDPARENT 1037
    ShowWindow $0 0
  FunctionEnd
!macroend

; ================================================================
; INSTALL / UNINSTALL EXTRAS
; ================================================================
!macro customInstall
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
  CreateShortCut "$QUICKLAUNCH\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\HexBrief"
  Delete "$QUICKLAUNCH\HexBrief.lnk"
!macroend
