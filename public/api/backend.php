<?php
// CORS Ayarları (React Frontend ile haberleşebilmesi için)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Preflight request (OPTIONS) kontrolü
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Veritabanı Bağlantı Bilgileri
// TODO! NATRO PANELİNDEN BU BİLGİLERİ DOLDURMALISINIZ
$host = "localhost";
$db_name = "KENDI_VERITABANI_ADINIZ_BURAYA";
$username = "KENDI_KULLANICI_ADINIZ_BURAYA";
$password = "KENDI_SIFRENIZ_BURAYA";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode(["error" => "Veritabanı bağlantı hatası: " . $exception->getMessage()]);
    exit();
}

// JSON olarak gelen isteği oku
$data = json_decode(file_get_contents("php://input"));
$action = isset($_GET['action']) ? $_GET['action'] : '';

// -- TABLOLARI OTOMATİK OLUŞTURMA FONKSİYONU --
function initializeDatabase($conn) {
    // Ürünler Tablosu
    $conn->exec("CREATE TABLE IF NOT EXISTS asil_products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        longDescription TEXT,
        specs TEXT,
        image LONGTEXT,
        type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Blog Tablosu
    $conn->exec("CREATE TABLE IF NOT EXISTS asil_blog (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content LONGTEXT,
        image LONGTEXT,
        date VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Slider Tablosu
    $conn->exec("CREATE TABLE IF NOT EXISTS asil_slides (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        tag VARCHAR(100),
        image LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Ayarlar Tablosu
    $conn->exec("CREATE TABLE IF NOT EXISTS asil_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value LONGTEXT
    )");
}

// İlk çalışmada tabloları kontrol et ve yoksa oluştur
initializeDatabase($conn);

// --- API UÇ NOKTALARI (ENDPOINTS) ---
try {
    switch($action) {
        
        // ---- PRODUCTS (ÜRÜNLER) ----
        case 'get_products':
            $stmt = $conn->prepare("SELECT * FROM asil_products ORDER BY created_at DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'save_products':
            if ($data && is_array($data)) {
                // Önce tümünü temizle
                $conn->exec("DELETE FROM asil_products");
                // Sonra yenileri ekle
                $stmt = $conn->prepare("INSERT INTO asil_products (id, name, price, description, longDescription, specs, image, type) VALUES (:id, :name, :price, :description, :longDescription, :specs, :image, :type)");
                foreach($data as $product) {
                    $stmt->execute([
                        ':id' => $product->id,
                        ':name' => $product->name,
                        ':price' => $product->price,
                        ':description' => isset($product->description) ? $product->description : '',
                        ':longDescription' => isset($product->longDescription) ? $product->longDescription : '',
                        ':specs' => isset($product->specs) ? $product->specs : '',
                        ':image' => isset($product->image) ? $product->image : '',
                        ':type' => isset($product->type) ? $product->type : ''
                    ]);
                }
                echo json_encode(["success" => true, "message" => "Ürünler başarıyla kaydedildi"]);
            } else {
                echo json_encode(["error" => "Geçersiz ürün verisi formatı"]);
            }
            break;

        // ---- BLOG POSTS (BLOG YAZILARI) ----            
        case 'get_blog':
            $stmt = $conn->prepare("SELECT * FROM asil_blog ORDER BY created_at DESC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'save_blog':
            if ($data && is_array($data)) {
                $conn->exec("DELETE FROM asil_blog");
                $stmt = $conn->prepare("INSERT INTO asil_blog (id, title, excerpt, content, image, date) VALUES (:id, :title, :excerpt, :content, :image, :date)");
                foreach($data as $post) {
                    $stmt->execute([
                        ':id' => $post->id,
                        ':title' => $post->title,
                        ':excerpt' => isset($post->excerpt) ? $post->excerpt : '',
                        ':content' => isset($post->content) ? $post->content : '',
                        ':image' => isset($post->image) ? $post->image : '',
                        ':date' => isset($post->date) ? $post->date : ''
                    ]);
                }
                echo json_encode(["success" => true, "message" => "Blog başarıyla kaydedildi"]);
            }
            break;

        // ---- SLIDES (VİTRİN) ----
        case 'get_slides':
            $stmt = $conn->prepare("SELECT * FROM asil_slides ORDER BY created_at ASC");
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'save_slides':
            if ($data && is_array($data)) {
                $conn->exec("DELETE FROM asil_slides");
                $stmt = $conn->prepare("INSERT INTO asil_slides (id, title, subtitle, tag, image) VALUES (:id, :title, :subtitle, :tag, :image)");
                foreach($data as $slide) {
                    $stmt->execute([
                        ':id' => $slide->id,
                        ':title' => $slide->title,
                        ':subtitle' => isset($slide->subtitle) ? $slide->subtitle : '',
                        ':tag' => isset($slide->tag) ? $slide->tag : '',
                        ':image' => isset($slide->image) ? $slide->image : ''
                    ]);
                }
                echo json_encode(["success" => true, "message" => "Slaytlar başarıyla kaydedildi"]);
            }
            break;

        // ---- SETTINGS (AYARLAR) ----
        case 'get_settings':
            $stmt = $conn->prepare("SELECT * FROM asil_settings");
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $settingsObj = [];
            foreach($result as $row) {
                $settingsObj[$row['setting_key']] = $row['setting_value'];
            }
            echo json_encode(empty($settingsObj) ? new stdClass() : $settingsObj);
            break;
            
        case 'save_settings':
            if ($data && is_object($data)) {
                $conn->exec("DELETE FROM asil_settings");
                $stmt = $conn->prepare("INSERT INTO asil_settings (setting_key, setting_value) VALUES (:key, :value)");
                foreach($data as $key => $value) {
                    $stmt->execute([
                        ':key' => $key,
                        ':value' => (string)$value
                    ]);
                }
                echo json_encode(["success" => true, "message" => "Ayarlar başarıyla kaydedildi"]);
            }
            break;
            
        default:
            echo json_encode(["error" => "Geçersiz Eylem (Action) / Method Bulunamadı"]);
            break;
    }
} catch (Exception $e) {
    echo json_encode(["error" => "İşlem sırasında sunucu hatası: " . $e->getMessage()]);
}

?>
