// --- 全員分の一括保存処理 ---
async function saveAllRecords() {
    // 保存前にすべてのデータが入力されているかチェック
    const recordsToSave = [];
    for (const student of currentStudents) {
        const studentId = student.student_id;
        const category = document.getElementById(`cat-${studentId}`).value;
        const value = document.getElementById(`val-${studentId}`).value;

        if (!value) {
            alert(`${student.name} さんの「${category}」が入力・選択されていません。全員分入力してください。`);
            return; // ひとつでも未入力があれば処理を中断
        }
        recordsToSave.push({ student_id: studentId, category: category, value: value });
    }

    // ファイルの書き込み衝突を防ぐための直列処理
    let successCount = 0;
    btnSaveAll.disabled = true;
    btnSaveAll.innerText = "保存中...";

    try {
        // 全員分を1件ずつ順番にAPIに送信する（for...of と await の組み合わせ）
        for (const record of recordsToSave) {
            const response = await fetch(`${API_URL}/records`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(record)
            });

            if (!response.ok) throw new Error("保存エラー");
            successCount++;
        }
        alert(`${successCount}名分のデータを一括保存しました！`);
        searchStudents(); // 保存後に画面をリフレッシュ

    } catch (error) {
        alert("一部のデータの保存に失敗しました。管理者に連絡してください。");
    } finally {
        btnSaveAll.disabled = false;
        btnSaveAll.innerText = "全員分を一括保存する";
    }
}