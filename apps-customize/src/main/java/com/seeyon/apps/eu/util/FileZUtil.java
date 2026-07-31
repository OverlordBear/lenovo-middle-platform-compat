package com.seeyon.apps.eu.util;
import com.seeyon.ctp.util.DateUtil;
import com.seeyon.ctp.util.Strings;
import com.seeyon.ctp.util.json.JSONUtil;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jasypt.contrib.org.apache.commons.codec_1_3.binary.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.math.BigInteger;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class FileZUtil {
	private static final Log log = LogFactory.getLog(FileZUtil.class);
	private static volatile String secret = "6wIS31WeYj1i6hGLfzJoY5ToWhphKEDD9p4P8DZQqX9HZ+5D3Eq5/BSd4z2xr9g7D9ukes/0zot43PCj/Og9Hw==";
	private static volatile String fileZurl = "http://43.142.34.184:8001";
	private static volatile String oaUrl = "http://101.35.43.199:80";
	private static volatile String repoId = "OA2";
    public static void main(String[] args) throws Exception {
//    	viewDemo();
    	String sendJson="{\"filename\":\"日报.docx\",\"ops\":[{\"actId\":\"UpdateBookmarkRef\",\"options\":{\"args\":[{\"dataType\":\"DOC\",\"bookname\":\"Content\",\"refName\":\"正文.docx\",\"dataRef\":\"https://4944501zwjr2.vicp.fun/seeyon/euFileZ.do?method=download&fileId=-9078832488339780108&fileName=2F2A05AA57B8CA45ED84C8892BBF32FF\"}]}}],\"callback\":\"https://4944501zwjr2.vicp.fun/seeyon/euFileZ.do?method=fileZredReturn\",\"fileUrl\":\"https://4944501zwjr2.vicp.fun/seeyon/euFileZ.do?method=download&fileId=6472121736197981332&fileName=7EF8164AC99AFEE4ED84C8892BBF32FF\"}";
    	publicapiUpdate(sendJson);
    }
    
    private static void redDemo() {
    	String url=fileZurl+"/content/update";
    }
    
    private static void viewDemo() {
    	try {
    		Map<String,Object> userInfoMap=new HashMap<String, Object>();
    		userInfoMap.put("id", "123456");
    		userInfoMap.put("display_name", "张三");
    		userInfoMap.put("email", "123456");
    		String userInfoJson = JSONUtil.toJSONString(userInfoMap);
    		byte[] userInfoByte = userInfoJson.getBytes("UTF-8");
    		String fileBase64Str =new String(Base64.encodeBase64(userInfoByte),"UTF-8");
    		String userInfo = URLEncoder.encode(fileBase64Str, "UTF-8");
    		Map<String,Object> metaMap=new HashMap<String, Object>();
    		metaMap.put("id", "4404259777340919552");
    		metaMap.put("name", "demo.doc");
    		metaMap.put("modified_at", DateUtil.format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"));//最后 修改时间 
    		Map<String,Object> created_by=new HashMap<String, Object>();
    		created_by.put("id", "123456");
    		created_by.put("name", "张三");
    		metaMap.put("created_by", created_by);
    		Map<String,Object> permissions=new HashMap<String, Object>();
    		permissions.put("write", true);
    		permissions.put("read", true);
    		metaMap.put("permissions", permissions);//是否有读权限
    		String metaJson = JSONUtil.toJSONString(metaMap);
    		System.out.println(metaJson);
    		byte[] metaByte = metaJson.getBytes("UTF-8");
    		String metaBase64Str =new String(Base64.encodeBase64(metaByte),"UTF-8");
    		String meta = URLEncoder.encode(metaBase64Str, "UTF-8");
    		String docId="4404259777340919552";
    		String action="view";
    		String params="fileId=4404259777340919552";
    		String downloadUrl=oaUrl+"/seeyon/euFileZ.do?method=download";
    		String uploadUrl="";
    		String url="/docs/app/driver-callback?repoId="+repoId+"&docId="+docId+"&action="+action+"&userinfo="+userInfo+"&meta="+meta+"&downloadUrl="+downloadUrl+"&uploadUrl="+uploadUrl+"&params="+params;
    		url=getPathWithHmac(url);
    		String newUrl=fileZurl+url;
    		System.out.println(newUrl);
		} catch (Exception e) {
			log.error("", e);
		}
    }
    
    public static InputStream httpGet(String url, Map<String, String> params) {
        StringBuilder data = new StringBuilder();
        InputStream inputStream = null;
        try {
            StringBuilder urls = new StringBuilder(url);
            if (params != null && !params.isEmpty()) {
                for (String key : params.keySet()) {
                    String value = params.get(key);
                    if (Strings.isNotBlank(value)) {
                        if (urls.indexOf("?") == -1) {
                            urls.append("?");
                        } else {
                            urls.append("&");
                        }
                        urls.append(key).append("=").append(URLEncoder.encode(value == null ? "" : value, "UTF-8"));
                    }
                }
            }
            URL connect = new URL(urls.toString());
            HttpURLConnection http = (HttpURLConnection) connect.openConnection();
            http.setConnectTimeout(100000);
            http.setReadTimeout(8000);
            http.setRequestMethod("GET");
            http.setDoOutput(true);
            http.setDoInput(true);
            http.setUseCaches(false);// post不能使用缓存
            http.setInstanceFollowRedirects(true);
            http.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
            http.setRequestProperty("Accept", "application/json, text/javascript, */*;q=0.01");
            http.setRequestProperty("Accept-Encoding", "gzip, deflate");
            http.setRequestProperty("Accept-Language", "zh-cn");
            http.setRequestProperty("Connection", "Keep-Alive");
            http.setRequestProperty("X-Requested-With", "XMLHttpRequest");
            http.setRequestProperty("User-Agent", "Mozilla/0 (compatible; MSIE 0; Windows NT 1;SV1)");
            
            String timeStamp=System.currentTimeMillis() + "";
    		String nonce=UUID.randomUUID().toString();
            http.setRequestProperty("timeStamp", timeStamp);
            http.setRequestProperty("zOffice-message-nonce", nonce);
            String authorization=getAuthToken("",timeStamp,nonce);
            http.setRequestProperty("Authorization", authorization);
            http.setRequestProperty("zOffice-auth-type", "s2s_MD5_sig");
            
            inputStream = http.getInputStream();
        } catch (Exception e) {
            log.error("调用httpGet返回时错误！", e);
        }
        return inputStream;
    }
    
    public static String publicapiUpdate(String reqBodyJsonStr) {//书签替换
        return publicapiUpdate(reqBodyJsonStr, fileZurl);
    }

    /**
     * 使用本次调用显式传入的 FileZ 根地址执行书签替换。
     * 该地址只在当前请求中生效，不会修改旧重载方法使用的进程级默认地址。
     */
    public static String publicapiUpdate(String reqBodyJsonStr, String fileZBaseUrl) {
    	String redString="";
    	try {
    		log.info("reqBodyJsonStr"+reqBodyJsonStr);
    		Map<String,String> headerMap=new HashMap<String, String>();
    		String timeStamp=System.currentTimeMillis() + "";
    		String nonce=UUID.randomUUID().toString();
    		headerMap.put("timeStamp", timeStamp);
    		headerMap.put("zOffice-message-nonce", nonce);
    		String authorization=getAuthToken(reqBodyJsonStr,timeStamp,nonce);
    		headerMap.put("Authorization", authorization);
    		headerMap.put("zOffice-auth-type", "s2s_MD5_sig");
    		String requestUrl=joinBaseUrl(fileZBaseUrl, "/docs/publicapi/v1/content/update");
    		log.info("requestUrl:"+requestUrl);
    		redString = post(requestUrl, reqBodyJsonStr, headerMap);
    		log.info("redString:"+redString);
		} catch (Exception e) {
			log.error("publicapiUpdate", e);
		}
    	return redString;
    }
    
    public static String changePdf(String reqBodyJsonStr) {//转pdf
        return changePdf(reqBodyJsonStr, fileZurl);
    }

    /**
     * 使用本次调用显式传入的 FileZ 根地址执行 PDF 转换，
     * 不修改进程级默认地址。
     */
    public static String changePdf(String reqBodyJsonStr, String fileZBaseUrl) {
    	String redString="";
    	try {
    		log.info("reqBodyJsonStr"+reqBodyJsonStr);
    		Map<String,String> headerMap=new HashMap<String, String>();
    		String timeStamp=System.currentTimeMillis() + "";
    		String nonce=UUID.randomUUID().toString();
    		headerMap.put("timeStamp", timeStamp);
    		headerMap.put("zOffice-message-nonce", nonce);
    		String authorization=getAuthToken(reqBodyJsonStr,timeStamp,nonce);
    		headerMap.put("Authorization", authorization);
    		headerMap.put("zOffice-auth-type", "s2s_MD5_sig");
    		String requestUrl=joinBaseUrl(fileZBaseUrl, "/docs/publicapi/v1/convert");
    		log.info("requestUrl:"+requestUrl);
    		redString = post(requestUrl, reqBodyJsonStr, headerMap);
    		log.info("pdfString:"+redString);
		} catch (Exception e) {
			log.error("changePdf", e);
		}
    	return redString;
    }

    private static String joinBaseUrl(String baseUrl, String path) {
        String normalized = baseUrl == null ? "" : baseUrl.trim();
        while (normalized.endsWith("/") && !normalized.endsWith("://")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized + path;
    }
    
    private static String getAuthToken(String reqBodyJsonStr,String timestamp,String nonce) {
		String token="";
		String authToken="";
		try {
//			String timestamp = System.currentTimeMillis() + "";
//			String nonce=UUID.randomUUID().toString();
			MessageDigest md5 = MessageDigest.getInstance("MD5");
			String seed = secret + "@@" + timestamp + "@@" +nonce;
			if (reqBodyJsonStr != null && reqBodyJsonStr.length() != 0) {
				seed += "@@" + reqBodyJsonStr;
			}
			md5.update(seed.getBytes(StandardCharsets.UTF_8));
			authToken= String.format("%032x", new BigInteger(1, md5.digest()));
		} catch (NoSuchAlgorithmException e) {
			log.error("getAuthToken",e);
		}
		String appId = "publicApi";
		// 请求头Authorization
		token = repoId + ":" + appId + ":" + authToken;
		return token;
	}
    
    public static String getPathWithHmac(String path) {
		String result="";
		try {
			StringBuilder builder = new StringBuilder(path);
			builder.append("&ts=").append((new Date()).getTime());
			SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(secretKeySpec);
			mac.update(builder.toString().getBytes(StandardCharsets.UTF_8));
			String hmac = String.format("%064x", new BigInteger(1, mac.doFinal()));
			builder.append("&HMAC=").append(hmac);
			return builder.toString();
		} catch (Exception e) {
			log.error("getPathWithHmac", e);
		}
		return result;
	}
    
    public static String post(String requestUrl, String jsonString, Map<String, String> headMap) {
        HttpURLConnection connection = null;
        InputStream is = null;
        BufferedReader br = null;
        String result = null;
        try {
            // 创建远程url连接对象
            URL url = new URL(requestUrl);
            // 通过远程url连接对象打开一个连接，强转成httpURLConnection类
            connection = (HttpURLConnection) url.openConnection();
            // 设置连接方式：get
            connection.setRequestMethod("POST");
            // 设置连接主机服务器的超时时间：15000毫秒
            connection.setConnectTimeout(15000);
            // 设置读取远程返回的数据时间：60000毫秒
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            if (headMap != null) {
                for (String key : headMap.keySet()) {
                    connection.addRequestProperty(key, headMap.get(key));
                }
            }
            // 设置是否从 httpUrlConnection 读入，默认情况下是true;
            connection.setDoInput(true);
            connection.setReadTimeout(60000);
            // 发送请求
            connection.connect();
            OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream(), "UTF-8");
            writer.write(jsonString);
            writer.flush();
            // 通过connection连接，获取输入流
            int responseCode = connection.getResponseCode();
            log.info("filezcode:" + responseCode);
            if (responseCode == 200) {
                is = connection.getInputStream();
                // 封装输入流is，并指定字符集
                br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
                // 存放数据
                StringBuffer sbf = new StringBuffer();
                String temp = null;
                while ((temp = br.readLine()) != null) {
                    sbf.append(temp);
                    sbf.append("\r\n");
                }
                result = sbf.toString();
            }else {
            	is = connection.getErrorStream();
                // 封装输入流is，并指定字符集
                br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
                // 存放数据
                StringBuffer sbf = new StringBuffer();
                String temp = null;
                while ((temp = br.readLine()) != null) {
                    sbf.append(temp);
                    sbf.append("\r\n");
                }
                result = sbf.toString();
            }
        } catch (Exception e) {
            log.error("", e);
        } finally {
            IOUtils.closeQuietly(br);
            IOUtils.closeQuietly(is);
            if (connection != null) {
                connection.disconnect();
            }
        }
        return result;
    }

	public static void setSecret(String secret) {
		FileZUtil.secret = secret;
	}

	public static void setFileZurl(String fileZurl) {
		FileZUtil.fileZurl = fileZurl;
	}

	public static void setOaUrl(String oaUrl) {
		FileZUtil.oaUrl = oaUrl;
	}

	public static void setRepoId(String repoId) {
		FileZUtil.repoId = repoId;
	}

	//gjx-start：2026-07-09 静态 getter——当前生效值即"出厂默认值"，供配置中心 DB 无值时回退（对应参考项目的 properties 兜底）
	public static String getSecret() {
		return secret;
	}

	public static String getFileZurl() {
		return fileZurl;
	}

	public static String getOaUrl() {
		return oaUrl;
	}

	public static String getRepoId() {
		return repoId;
	}
	//gjx-end

}
