1. 사용자는 @ 뒤에 entity 를 입력한다. 그러면 가능한 후보가 드롭다운(위쪽)에 등장한다. 
2. tab or space 를 눌러서 entity 를 확정한다.(동시에 커서는 space 한칸 뒤에 위치한다.) 그러면 2가지 경우가 존재.
    a. 이미 존재하는 entity 인경우.
        이때는 entity recommendation 에서 그 entity 관련 memo 를 보여준다.
    b. 존재하지 않는 entity 인 경우. 
        이때는 확정하는 순간 C:\Users\wondo\dev\unlooped-mvp\.worktrees\build-check\app\api\ai\classify-entity\route.ts 여기로 api call 을 보내서 type 을 정한다. (비동기적으로 이루어짐)
        api call 이 오면 type 에 따라 색깔이 배정됨. 
3. @ 를 여러개 할 수도 있음. 그 상태에서 메모 저장을 하면 그러면 위의 규칙에 따라 존재하지 않던 entity 언급이 포함되었을 경우, 그 entity 가 생성이 됨. 그리고 메모는 저장이 됨. 

메모 저장은 ctrl + enter 로 되고, tab 을 그냥 눌렀을 경우에는 아무 일도 일어나지 않음. (@뒤에서 space 없을 때만 tab 은 확정이라는 역할을 함.)




추가 수정사항
1. 엔터가 하나라도 있는 상태에서 새로운 언급을 하면, 엔터가 사라짐. (아마도 highlighting 에 엔터 기능이 없나봄)
2. 다른 input 창에서도 동일한 기능을 사용할수도 있으니까 이 로직을 재사용 가능하게 만들어줄 수 있나?? 
3. 두번째 언급 이상에서 entity recommendation 기능이 무한로딩이 되는 버그가 있는거같다. (간헐적으로 발생...)
4. 마우스 올려도 아무 변화 없음. 