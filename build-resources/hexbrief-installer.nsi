; ================================================================
; HexBrief Custom NSIS Installer — Full branded UI, no MUI2
; All pages use nsDialogs with the dark navy sidebar on every screen
; ================================================================

Unicode true
RequestExecutionLevel user
ManifestDPIAware true

; electron-builder injects these via command line defines:
; APP_64, APP_32, VERSION, PRODUCT_NAME, INSTDIR, BUILD_RESOURCES_DIR
; and sharedHeader provides: installApplicationFiles, StdUtils, plugins

!include "nsDialogs.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"
!include "WinVer.nsh"
!include "common.nsh"

Name "HexBrief"
BrandingText " "
ShowInstDetails nevershow
ShowUninstDetails nevershow

; ── Variables ────────────────────────────────────────────────────
Var hDialog
Var hSidebar
Var hProgressBar
Var hLogLabel
Var hCheckLaunch
Var hCheckDesktop
Var hCheckStartMenu
Var hDirRequest
Var InstDir_
Var DesktopShortcut_
Var StartMenuShortcut_

; ── Pages ────────────────────────────────────────────────────────
Page custom pg_Welcome_Show pg_Welcome_Leave
Page custom pg_Options_Show pg_Options_Leave
Page custom pg_Install_Show pg_Install_Leave
Page custom pg_Finish_Show

UninstPage custom un_Confirm_Show un_Confirm_Leave
UninstPage custom un_Progress_Show un_Progress_Leave

; ================================================================
; SHARED: Draw sidebar (called on every page)
; ================================================================
!macro HB_Sidebar
  ${NSD_CreateBitmap} 0 0 160u 100%u ""
  Pop $0
  ${NSD_SetImage} $0 "${BUILD_RESOURCES_DIR}\installerSidebar.bmp" $1

  ; Red top bar
  ${NSD_CreateLabel} 0 0 160u 3u ""
  Pop $0
  SetCtlColors $0 "" "0xe8412a"

  ; Red right edge
  ${NSD_CreateLabel} 157u 0 3u 100%u ""
  Pop $0
  SetCtlColors $0 "" "0xe8412a"

  ; Dark divider next to edge
  ${NSD_CreateLabel} 154u 0 3u 100%u ""
  Pop $0
  SetCtlColors $0 "" "0x0f1629"
!macroend

; ================================================================
; SHARED: Dark header bar (top of content area)
; $R0 = title, $R1 = subtitle, $R2 = accent colour (0=red, 1=green)
; ================================================================
!macro HB_Header title subtitle accentcol
  ${NSD_CreateLabel} 160u 0 320u 52u ""
  Pop $0
  SetCtlColors $0 "" "0x0a0f1e"

  ${NSD_CreateLabel} 172u 10u 300u 20u "${title}"
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x0a0f1e"
  CreateFont $R9 "DM Sans" 12 700
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 172u 33u 300u 14u "${subtitle}"
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x0a0f1e"
  CreateFont $R9 "Courier New" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ; Accent bottom border
  !if "${accentcol}" == "green"
    ${NSD_CreateLabel} 160u 50u 320u 3u ""
    Pop $0
    SetCtlColors $0 "" "0x4caf50"
  !else
    ${NSD_CreateLabel} 160u 50u 320u 3u ""
    Pop $0
    SetCtlColors $0 "" "0xe8412a"
  !endif
!macroend

; ================================================================
; SHARED: Step progress dots
; $R0 = active step (1-4)
; ================================================================
!macro HB_Dots active
  !define DOT_Y 278u
  !define DOTS_X 255u

  ${NSD_CreateLabel} 255u ${DOT_Y} 8u 5u ""
  Pop $0
  !if "${active}" == "1"
    SetCtlColors $0 "" "0xe8412a"
  !else
    SetCtlColors $0 "" "0x2e3a60"
  !endif

  ${NSD_CreateLabel} 267u ${DOT_Y} 6u 5u ""
  Pop $0
  !if "${active}" == "2"
    SetCtlColors $0 "" "0xe8412a"
  !else
    SetCtlColors $0 "" "0x2e3a60"
  !endif

  ${NSD_CreateLabel} 277u ${DOT_Y} 6u 5u ""
  Pop $0
  !if "${active}" == "3"
    SetCtlColors $0 "" "0xe8412a"
  !else
    SetCtlColors $0 "" "0x2e3a60"
  !endif

  ${NSD_CreateLabel} 287u ${DOT_Y} 6u 5u ""
  Pop $0
  !if "${active}" == "4"
    SetCtlColors $0 "" "0xe8412a"
  !else
    SetCtlColors $0 "" "0x2e3a60"
  !endif
!macroend

; ================================================================
; PAGE 1: WELCOME
; ================================================================
Function pg_Welcome_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Welcome to HexBrief" "Personal morning dashboard installer" "red"
  !insertmacro HB_Dots "1"

  ${NSD_CreateLabel} 172u 66u 298u 16u "HexBrief is your personal morning dashboard."
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x161e35"
  CreateFont $R9 "DM Sans" 10 500
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 172u 86u 298u 32u "Weather, tasks, headlines and calendar in one place. No accounts. No tracking. No subscriptions."
  Pop $0
  SetCtlColors $0 "0x9aa5c8" "0x161e35"
  CreateFont $R9 "DM Sans" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 172u 122u 298u 14u "Click Next to continue."
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x161e35"
  CreateFont $R9 "DM Sans" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  nsDialogs::Show
FunctionEnd

Function pg_Welcome_Leave
FunctionEnd

; ================================================================
; PAGE 2: OPTIONS
; ================================================================
Function pg_Options_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Install location" "Choose where to install HexBrief" "red"
  !insertmacro HB_Dots "2"

  ${NSD_CreateLabel} 172u 66u 160u 12u "Destination folder:"
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x161e35"
  CreateFont $R9 "Courier New" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateDirRequest} 172u 80u 298u 16u "$InstDir_"
  Pop $hDirRequest
  SetCtlColors $hDirRequest "0xf0f2f8" "0x0f1629"
  CreateFont $R9 "Courier New" 9 400
  SendMessage $hDirRequest ${WM_SETFONT} $R9 0

  ${NSD_CreateCheckbox} 174u 106u 280u 15u "Create desktop shortcut"
  Pop $hCheckDesktop
  SetCtlColors $hCheckDesktop "0xf0f2f8" "0x161e35"
  ${NSD_SetState} $hCheckDesktop ${BST_CHECKED}

  ${NSD_CreateCheckbox} 174u 124u 280u 15u "Add to Start Menu"
  Pop $hCheckStartMenu
  SetCtlColors $hCheckStartMenu "0xf0f2f8" "0x161e35"
  ${NSD_SetState} $hCheckStartMenu ${BST_CHECKED}

  nsDialogs::Show
FunctionEnd

Function pg_Options_Leave
  ${NSD_GetText} $hDirRequest $InstDir_
  StrCpy $INSTDIR "$InstDir_"
  ${NSD_GetState} $hCheckDesktop $DesktopShortcut_
  ${NSD_GetState} $hCheckStartMenu $StartMenuShortcut_
FunctionEnd

; ================================================================
; PAGE 3: INSTALL
; ================================================================
Function pg_Install_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Installing..." "Please wait while files are extracted" "red"
  !insertmacro HB_Dots "3"

  ${NSD_CreateLabel} 172u 66u 200u 12u "Extracting application files:"
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x161e35"
  CreateFont $R9 "Courier New" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateProgressBar} 172u 81u 298u 14u ""
  Pop $hProgressBar
  SendMessage $hProgressBar ${PBM_SETRANGE} 0 0x640000
  SendMessage $hProgressBar ${PBM_SETPOS} 0 0

  ${NSD_CreateLabel} 172u 99u 298u 12u ""
  Pop $hLogLabel
  SetCtlColors $hLogLabel "0x6070a8" "0x161e35"
  CreateFont $R9 "Courier New" 8 400
  SendMessage $hLogLabel ${WM_SETFONT} $R9 0

  ; Terminal panel
  ${NSD_CreateLabel} 172u 116u 298u 58u ""
  Pop $0
  SetCtlColors $0 "" "0x0a0f1e"

  nsDialogs::Show

  ; ── Actual install ──────────────────────────────────────
  SetDetailsPrint none
  SetOutPath "$INSTDIR"

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Extracting app.asar..."
  SendMessage $hProgressBar ${PBM_SETPOS} 15 0

  ${If} ${RunningX64}
    File /r "${APP_64}"
  ${Else}
    File /r "${APP_32}"
  ${EndIf}

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Creating shortcuts..."
  SendMessage $hProgressBar ${PBM_SETPOS} 55 0

  WriteUninstaller "$INSTDIR\Uninstall HexBrief.exe"

  ${If} $DesktopShortcut_ == ${BST_CHECKED}
    CreateShortcut "$DESKTOP\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
  ${EndIf}

  ${If} $StartMenuShortcut_ == ${BST_CHECKED}
    CreateDirectory "$SMPROGRAMS\HexBrief"
    CreateShortcut "$SMPROGRAMS\HexBrief\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
    CreateShortcut "$SMPROGRAMS\HexBrief\Uninstall.lnk" "$INSTDIR\Uninstall HexBrief.exe"
  ${EndIf}

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Writing registry entries..."
  SendMessage $hProgressBar ${PBM_SETPOS} 80 0

  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "DisplayName" "HexBrief"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "UninstallString" '"$INSTDIR\Uninstall HexBrief.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "Publisher" "HexBrief"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "DisplayIcon" "$INSTDIR\HexBrief.exe"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "EstimatedSize" ${ESTIMATED_SIZE}
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "NoRepair" 1

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Done."
  SendMessage $hProgressBar ${PBM_SETPOS} 100 0
FunctionEnd

Function pg_Install_Leave
FunctionEnd

; ================================================================
; PAGE 4: FINISH
; ================================================================
Function pg_Finish_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Installation complete" "HexBrief ${VERSION} is ready" "green"
  !insertmacro HB_Dots "4"

  ${NSD_CreateLabel} 220u 74u 240u 16u "Installed successfully."
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x161e35"
  CreateFont $R9 "DM Sans" 11 500
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 210u 94u 260u 24u "Open it each morning for your daily brief."
  Pop $0
  SetCtlColors $0 "0x9aa5c8" "0x161e35"
  CreateFont $R9 "DM Sans" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateCheckbox} 212u 124u 250u 15u "Launch HexBrief now"
  Pop $hCheckLaunch
  SetCtlColors $hCheckLaunch "0xf0f2f8" "0x161e35"
  ${NSD_SetState} $hCheckLaunch ${BST_CHECKED}

  nsDialogs::Show

  ${NSD_GetState} $hCheckLaunch $0
  ${If} $0 == ${BST_CHECKED}
    Exec '"$INSTDIR\HexBrief.exe"'
  ${EndIf}
FunctionEnd

; ================================================================
; UNINSTALLER: CONFIRM
; ================================================================
Function un_Confirm_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Uninstall HexBrief" "Remove HexBrief from your computer" "red"

  ${NSD_CreateLabel} 172u 66u 298u 32u "This will remove HexBrief and all its files, including your saved settings, tasks and preferences."
  Pop $0
  SetCtlColors $0 "0x9aa5c8" "0x161e35"
  CreateFont $R9 "DM Sans" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 172u 104u 298u 14u "Click Uninstall to continue."
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x161e35"

  nsDialogs::Show
FunctionEnd

Function un_Confirm_Leave
FunctionEnd

; ================================================================
; UNINSTALLER: PROGRESS
; ================================================================
Function un_Progress_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Removing HexBrief..." "Cleaning up files and registry entries" "red"

  ${NSD_CreateProgressBar} 172u 80u 298u 14u ""
  Pop $hProgressBar
  SendMessage $hProgressBar ${PBM_SETRANGE} 0 0x640000
  SendMessage $hProgressBar ${PBM_SETPOS} 0 0

  ${NSD_CreateLabel} 172u 99u 298u 12u ""
  Pop $hLogLabel
  SetCtlColors $hLogLabel "0x6070a8" "0x161e35"
  CreateFont $R9 "Courier New" 8 400
  SendMessage $hLogLabel ${WM_SETFONT} $R9 0

  nsDialogs::Show

  ; ── Actual uninstall ────────────────────────────────────
  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Closing HexBrief..."
  SendMessage $hProgressBar ${PBM_SETPOS} 10 0

  nsProcess::_FindProcess "HexBrief.exe"
  Pop $R0
  ${If} $R0 == 0
    nsProcess::_KillProcess "HexBrief.exe"
    Sleep 800
  ${EndIf}

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Removing files..."
  SendMessage $hProgressBar ${PBM_SETPOS} 30 0
  RMDir /r "$INSTDIR"

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Removing app data..."
  SendMessage $hProgressBar ${PBM_SETPOS} 55 0
  RMDir /r "$APPDATA\HexBrief"
  RMDir /r "$LOCALAPPDATA\HexBrief"

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Removing shortcuts..."
  SendMessage $hProgressBar ${PBM_SETPOS} 75 0
  Delete "$DESKTOP\HexBrief.lnk"
  Delete "$SMPROGRAMS\HexBrief\HexBrief.lnk"
  Delete "$SMPROGRAMS\HexBrief\Uninstall.lnk"
  RMDir "$SMPROGRAMS\HexBrief"
  Delete "$SMSTARTUP\HexBrief.lnk"
  Delete "$QUICKLAUNCH\HexBrief.lnk"

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Cleaning registry..."
  SendMessage $hProgressBar ${PBM_SETPOS} 90 0
  DeleteRegKey HKCU "Software\HexBrief"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "HexBrief"

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Done."
  SendMessage $hProgressBar ${PBM_SETPOS} 100 0
FunctionEnd

Function un_Progress_Leave
FunctionEnd

; ================================================================
; SECTIONS (required by NSIS even with custom pages)
; ================================================================
Section "Install" SEC_INSTALL
SectionEnd

Section "Uninstall"
SectionEnd

; ================================================================
; INIT
; ================================================================
Function .onInit
  StrCpy $InstDir_ "$LOCALAPPDATA\Programs\HexBrief"
  ${If} ${RunningX64}
    SetRegView 64
  ${EndIf}
FunctionEnd

Function un.onInit
  SetRegView 64
FunctionEnd
