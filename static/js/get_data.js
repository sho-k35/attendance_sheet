const API_URL = "";
let currentStudents = []; // 検索した生徒のリストを保持しておく変数

// --- データの検索と描画 ---
async function searchStudents() {
    const grade = document.getElementById("inputGrade").value;
    const class_name = document.getElementById("inputClass").value;
    const school = document.getElementById("inputSchool").value;

    const params = new URLSearchParams();
    if (grade) params.append("grade",grade);
    if (class_name) params.append("class_name",class_name);
    if (school) params.append("school",school);

    try {
        const response = await fetch(`${API_URL}/students?${params.toString()}`);
        if (!response.ok) throw new Error("データの取得に失敗しました");
        
        currentStudents = await response.json();
        renderTable();
    } catch (error) {
        alert(error.message);
    }
}

function renderTable() {
    const tbody = document.getElementById("studentTableBody");
    const btnSaveAll = document.getElementById("btnSaveAll");
    tbody.innerHTML = ""; 

    if (currentStudents.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align: center;'>該当する生徒がいません。</td></tr>";
        btnSaveAll.style.display = "none"; // 生徒がいない時はボタンを隠す
        return;
    }

    currentStudents.forEach(student => {
        const row = `
            <tr>
                <td>${student.student_id}</td>
                <td>${student.name}</td>
                <td>${student.name2}</td>
                <td>
                    <!-- onchangeイベントで、カテゴリが変わった瞬間にUIを切り替える -->
                    <select id="cat-${student.student_id}" onchange="changeInputUI('${student.student_id}')">
                        <option value="出欠">出欠</option>
                        <option value="宿題">宿題</option>
                        <option value="小テスト">小テスト</option>
                    </select>
                </td>
                <td id="val-container-${student.student_id}" class="val-container">
                    <!-- ここはJSの関数で動的に生成されます -->
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
        
        // 行を追加した直後に、初期状態（出欠）のUIを描画する
        changeInputUI(student.student_id);
    });

    btnSaveAll.style.display = "inline-block"; // 保存ボタンを表示
}

// --- カテゴリに応じたUIの切り替え ---
function changeInputUI(studentId) {
    const category = document.getElementById(`cat-${studentId}`).value;
    const container = document.getElementById(`val-container-${studentId}`);

    if (category === "出欠" || category === "宿題") {
        // 〇×ボタンのUI（裏で値を保持するための hidden input を仕込む）
        container.innerHTML = `
            <button type="button" id="btn-o-${studentId}" class="btn-circle" onclick="setBtnValue('${studentId}', '出席')">O</button>
            <button type="button" id="btn-x-${studentId}" class="btn-circle" onclick="setBtnValue('${studentId}', '欠席')">X</button>
            <input type="hidden" id="val-${studentId}" value="">
        `;
    } else if (category === "小テスト") {
        // 数値入力のUI
        container.innerHTML = `
            <input type="number" id="val-${studentId}" class="input-score" placeholder="点数" min="0" max="100"> 点
        `;
    }
}

// 〇×ボタンが押された時の見た目と値の更新
function setBtnValue(studentId, value) {
    document.getElementById(`val-${studentId}`).value = value;
    
    const btnO = document.getElementById(`btn-o-${studentId}`);
    const btnX = document.getElementById(`btn-x-${studentId}`);
    
    // 一旦リセット
    btnO.className = "btn-circle";
    btnX.className = "btn-circle";

    // 押されたボタンに色をつける
    if (value === '出席') btnO.classList.add("active-o");
    if (value === '欠席') btnX.classList.add("active-x");
}